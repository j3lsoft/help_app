import { Injectable, inject } from '@angular/core';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { LoggerService } from '../../../core/services/logger.service';
import { UploadApiService } from '../../../core/services/media/upload/services/upload-api.service';
import { MediaItem, POST_EDIT_STATE_NEUTRAL } from '../models/post-creation.model';
import { CreatePostRequestDto, PostResponseDto } from '../models/post.dto';
import { bakeImageFilter } from '../utils/image-bake.util';
import { PostsApiService } from './posts-api.service';

export type PublishStage = 'baking' | 'uploading' | 'creating';

export interface PublishParams {
  /** Optional array of MediaItem objects to publish (multi-media flow). */
  items?: MediaItem[];
  /** Legacy single-image fallback fields: */
  imageSrc?: string | null;
  filterCss?: string | null;
  transformCss?: string | null;
  pendingMediaId?: string | null;

  content: string | null;
  onStage?: (stage: PublishStage) => void;
  onUploadProgress?: (percent: number) => void;
}

export interface PublishResult {
  post: PostResponseDto;
  /** Primary / single mediaFileId (first mediaId or null for text-only Posts). */
  mediaFileId: string | null;
  /** Array of all confirmed media file IDs. */
  mediaFileIds: string[];
}

/** Publish failure carrying which stage failed and any confirmed media. */
export class PostPublishError extends Error {
  constructor(
    message: string,
    public readonly stage: PublishStage,
    public readonly cause?: unknown,
    public readonly uploadedMediaId?: string,
    public readonly uploadedMediaIds?: string[]
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

  async publish(params: PublishParams): Promise<PublishResult> {
    const content = params.content?.trim() ? params.content.trim() : null;

    // Resolve items to process
    const items = this.resolveMediaItems(params);
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

      // Upload items in order
      const itemProgress = new Array(items.length).fill(0);

      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        if (item.pendingMediaId) {
          this.logger.debug('Reusing previously uploaded media for retry', {
            context: 'PostPublishService',
            data: { mediaFileId: item.pendingMediaId, index: i },
          });
          confirmedMediaIds.push(item.pendingMediaId);
          itemProgress[i] = 100;
          continue;
        }

        try {
          params.onStage?.('uploading');

          const mediaFileId = await this.uploadSingleMedia(
            item,
            (percent) => {
              itemProgress[i] = percent;
              const totalProgress = Math.round(
                itemProgress.reduce((sum, p) => sum + p, 0) / items.length
              );
              params.onUploadProgress?.(totalProgress);
            }
          );

          item.pendingMediaId = mediaFileId;
          confirmedMediaIds.push(mediaFileId);
        } catch (error) {
          const firstConfirmed = confirmedMediaIds[0];
          throw new PostPublishError(
            `Upload failed for image item ${i + 1}`,
            error instanceof PostPublishError ? error.stage : 'uploading',
            error,
            firstConfirmed,
            [...confirmedMediaIds]
          );
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
      const firstConfirmed = confirmedMediaIds[0];
      throw new PostPublishError(
        'Post creation failed',
        'creating',
        error,
        firstConfirmed,
        [...confirmedMediaIds]
      );
    }
  }

  private resolveMediaItems(params: PublishParams): MediaItem[] {
    if (params.items && params.items.length > 0) {
      return params.items;
    }

    const imageSrc = (params.imageSrc ?? '').trim();
    if (imageSrc.length > 0 || params.pendingMediaId) {
      return [
        {
          id: 'legacy-item',
          image: { src: imageSrc, format: 'jpeg', origin: 'gallery' },
          filter: params.filterCss ?? '',
          edits: {
            ...POST_EDIT_STATE_NEUTRAL,
            rotate: this.parseRotateSteps(params.transformCss),
          },
          pendingMediaId: params.pendingMediaId ?? null,
        },
      ];
    }

    return [];
  }

  private parseRotateSteps(transformCss: string | null | undefined): number {
    if (!transformCss) return 0;
    const match = transformCss.match(/rotate\(\s*(-?\d+)\s*deg\s*\)/i);
    if (!match) return 0;
    const deg = parseInt(match[1], 10);
    const steps = Math.round(deg / 90) % 4;
    return (steps + 4) % 4;
  }

  private async uploadSingleMedia(
    item: MediaItem,
    onProgress?: (percent: number) => void
  ): Promise<string> {
    let file: File;

    try {
      const transformCss = item.edits.rotate
        ? `rotate(${item.edits.rotate * 90}deg)`
        : null;

      file = await bakeImageFilter(item.image.src, item.filter, {
        transform: transformCss,
        vignette: item.edits.vignette,
        sharpen: item.edits.sharpen,
      });
    } catch (error) {
      this.logger.error('Failed to bake image filter', {
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
        })
      );
    } catch (error) {
      throw new PostPublishError(
        'Could not request upload URL',
        'uploading',
        error
      );
    }

    try {
      await lastValueFrom(
        this.uploadApi.uploadToStorage(
          presigned.uploadUrl,
          file,
          onProgress
        )
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
        })
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
        error
      );
    }
  }
}
