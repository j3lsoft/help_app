import { Injectable, inject } from '@angular/core';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { LoggerService } from '../../../core/services/logger.service';
import { UploadApiService } from '../../../core/services/media/upload/services/upload-api.service';
import { MediaItem } from '../models/post-creation.model';
import { CreatePostRequestDto, PostResponseDto } from '../models/post.dto';
import {
  bakeImageFilter,
  isUploadableAsIs,
  loadSourceFile,
} from '../utils/image-bake.util';
import {
  buildEffectiveFilterCssForItem,
  buildEffectiveTransformCssForItem,
  hasVisualChanges,
} from '../utils/post-effective-filter.util';
import { PostsApiService } from './posts-api.service';

export type PublishStage = 'baking' | 'uploading' | 'creating';

export interface PublishParams {
  /** Array of MediaItem objects to publish (multi-media flow). */
  items?: MediaItem[];

  content: string | null;
  onStage?: (stage: PublishStage) => void;
  onUploadProgress?: (percent: number) => void;
  /** Per-file progress: index in items, percent 0..100, client item id. */
  onItemProgress?: (index: number, percent: number, itemId: string) => void;
}

export interface PublishResult {
  post: PostResponseDto;
  /** Primary / single mediaFileId (first mediaId or null for text-only Posts). */
  mediaFileId: string | null;
  /** Array of all confirmed media file IDs. */
  mediaFileIds: string[];
}

/** Publish failure carrying which stage failed and any confirmed media. */
const UPLOAD_CONCURRENCY = 3;

export class PostPublishError extends Error {
  constructor(
    message: string,
    public readonly stage: PublishStage,
    public readonly cause?: unknown,
    public readonly uploadedMediaId?: string,
    /** Per-index alignment with the published items; holes are failed/unstarted. */
    public readonly uploadedMediaIds?: (string | undefined)[],
  ) {
    super(message);
    this.name = 'PostPublishError';
  }
}

@Injectable({
  providedIn: 'root',
})
export class PostPublishService {
  private readonly uploadApi = inject(UploadApiService);
  private readonly postsApi = inject(PostsApiService);
  private readonly logger = inject(LoggerService);

  /**
   * Image rasterizer. A writable instance seam so specs can stub the expensive
   * canvas pipeline instead of patching the read-only ES module namespace.
   */
  bakeImage: typeof bakeImageFilter = bakeImageFilter;

  async publish(params: PublishParams): Promise<PublishResult> {
    const content = params.content?.trim() ? params.content.trim() : null;

    // Resolve items to process
    const items = params.items ?? [];
    const hasMedia = items.length > 0;

    if (!hasMedia && !content) {
      throw new PostPublishError('Cannot publish empty post', 'creating');
    }

    const confirmedMediaIds: string[] = [];

    if (hasMedia) {
      const needsBake = items.some((item) => !item.pendingMediaId);
      if (needsBake) {
        params.onStage?.('baking');
      }

      const itemProgress = new Array(items.length).fill(0);
      const mediaIdsByIndex: (string | null)[] = new Array(items.length).fill(
        null,
      );

      try {
        await mapWithConcurrency(
          items.map((_, index) => index),
          UPLOAD_CONCURRENCY,
          async (i) => {
            const mediaFileId = await this.uploadItemAtIndex(
              items,
              i,
              itemProgress,
              params,
            );
            mediaIdsByIndex[i] = mediaFileId;
            return mediaFileId;
          },
        );
      } catch (error) {
        const partialIds = this.buildUploadedMediaIdsByIndex(
          items,
          mediaIdsByIndex,
        );
        const firstConfirmed = partialIds.find((id): id is string =>
          Boolean(id),
        );
        const message =
          error instanceof PostPublishError
            ? error.message
            : error instanceof Error
              ? error.message
              : 'Upload failed';
        const stage =
          error instanceof PostPublishError ? error.stage : 'uploading';
        throw new PostPublishError(
          message,
          stage,
          error,
          firstConfirmed,
          // Keep the per-index shape: the composer maps holes back to items.
          partialIds,
        );
      }

      for (const id of mediaIdsByIndex) {
        if (id) {
          confirmedMediaIds.push(id);
        }
      }
    }

    params.onStage?.('creating');

    const dto: CreatePostRequestDto = {
      content,
      mediaIds: confirmedMediaIds,
    };

    try {
      const post = await firstValueFrom(this.postsApi.createPost(dto));
      const firstId = confirmedMediaIds[0] ?? null;
      return {
        post,
        mediaFileId: firstId,
        mediaFileIds: confirmedMediaIds,
      };
    } catch (error) {
      const uploadedByIndex = items.map(
        (item, i) => confirmedMediaIds[i] ?? item.pendingMediaId ?? undefined,
      );
      const firstConfirmed = confirmedMediaIds[0];
      throw new PostPublishError(
        'Post creation failed',
        'creating',
        error,
        firstConfirmed,
        uploadedByIndex,
      );
    }
  }

  private async uploadItemAtIndex(
    items: MediaItem[],
    index: number,
    itemProgress: number[],
    params: PublishParams,
  ): Promise<string> {
    const item = items[index];

    if (item.pendingMediaId) {
      this.logger.debug('Reusing previously uploaded media for retry', {
        context: 'PostPublishService',
        data: { mediaFileId: item.pendingMediaId, index },
      });
      itemProgress[index] = 100;
      params.onItemProgress?.(index, 100, item.id);
      return item.pendingMediaId;
    }

    params.onStage?.('uploading');
    params.onItemProgress?.(index, 0, item.id);

    const mediaFileId = await this.uploadSingleMedia(item, (percent) => {
      itemProgress[index] = percent;
      const totalProgress = Math.round(
        itemProgress.reduce((sum, p) => sum + p, 0) / items.length,
      );
      params.onUploadProgress?.(totalProgress);
      params.onItemProgress?.(index, percent, item.id);
    });

    params.onItemProgress?.(index, 100, item.id);
    return mediaFileId;
  }

  private buildUploadedMediaIdsByIndex(
    items: MediaItem[],
    mediaIdsByIndex: (string | null)[],
  ): (string | undefined)[] {
    return items.map(
      (item, i) => mediaIdsByIndex[i] ?? item.pendingMediaId ?? undefined,
    );
  }

  private async prepareUploadFile(item: MediaItem): Promise<File> {
    // A web blob with no visual edits is already an encoded file the user
    // chose, so skip the canvas round-trip when it fits the upload budget.
    // Gallery/camera sources are still normalized (size, format, EXIF).
    if (!hasVisualChanges(item) && item.image.origin === 'web') {
      const original = await loadSourceFile(item.image.src, item.image.format);
      if (original && isUploadableAsIs(original)) {
        this.logger.debug('Uploading original web image without re-encoding', {
          context: 'PostPublishService',
          data: { size: original.size, type: original.type },
        });
        return original;
      }
    }

    const effectiveFilter = buildEffectiveFilterCssForItem(item);
    const transformCss = buildEffectiveTransformCssForItem(item) || null;

    return this.bakeImage(item.image.src, effectiveFilter || null, {
      transform: transformCss,
      vignette: item.edits.vignette,
      sharpen: item.edits.sharpen,
    });
  }

  private async uploadSingleMedia(
    item: MediaItem,
    onProgress?: (percent: number) => void,
  ): Promise<string> {
    let file: File;

    try {
      file = await this.prepareUploadFile(item);
    } catch (error) {
      this.logger.error('Failed to prepare image for upload', {
        context: 'PostPublishService',
        data: { error },
      });
      throw new PostPublishError('Image processing failed', 'baking', error);
    }

    let presigned;

    try {
      presigned = await firstValueFrom(
        this.uploadApi.getPresignedUrl({
          mimeType: file.type,
          originalName: file.name,
          size: file.size,
        }),
      );
    } catch (error) {
      throw new PostPublishError(
        'Could not request upload URL',
        'uploading',
        error,
      );
    }

    try {
      await lastValueFrom(
        this.uploadApi.uploadToStorage(presigned.uploadUrl, file, onProgress),
      );
    } catch (error) {
      throw new PostPublishError('Storage upload failed', 'uploading', error);
    }

    try {
      const media = await firstValueFrom(
        this.uploadApi.confirmUpload({
          fileId: presigned.id,
          key: presigned.key,
          mimeType: file.type,
          originalName: file.name,
          size: file.size,
        }),
      );
      return media.id;
    } catch (error) {
      this.logger.error('Upload confirmation failed', {
        context: 'PostPublishService',
        data: { fileId: presigned.id, key: presigned.key },
      });
      throw new PostPublishError(
        'Upload confirmation failed',
        'uploading',
        error,
      );
    }
  }
}

/**
 * Runs async work over values with a fixed concurrency limit; results match input order.
 * After the first failure it stops handing out new slots and waits for the in-flight
 * workers to settle before rejecting, so callers never leave uploads running in the
 * background (which would otherwise be re-uploaded on retry).
 */
async function mapWithConcurrency<T, R>(
  values: T[],
  limit: number,
  fn: (value: T) => Promise<R>,
): Promise<R[]> {
  if (values.length === 0) {
    return [];
  }

  const results: R[] = new Array(values.length);
  let nextSlot = 0;
  let firstError: unknown = null;

  const worker = async (): Promise<void> => {
    while (firstError === null) {
      const slot = nextSlot++;
      if (slot >= values.length) {
        return;
      }
      try {
        results[slot] = await fn(values[slot]);
      } catch (error) {
        if (firstError === null) {
          firstError = error;
        }
      }
    }
  };

  const workerCount = Math.min(Math.max(1, limit), values.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));

  if (firstError !== null) {
    throw firstError;
  }
  return results;
}
