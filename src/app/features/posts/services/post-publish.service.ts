import { Injectable, inject } from '@angular/core';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { LoggerService } from '../../../core/services/logger.service';
import { UploadApiService } from '../../../core/services/media/upload/services/upload-api.service';
import { CreatePostRequestDto, PostResponseDto } from '../models/post.dto';
import { bakeImageFilter } from '../utils/image-bake.util';
import { PostsApiService } from './posts-api.service';

export type PublishStage = 'baking' | 'uploading' | 'creating';

export interface PublishParams {
  /** WebView-loadable URL of the selected image. Empty/null for text-only Posts. */
  imageSrc?: string | null;
  filterCss?: string | null;
  /** CSS transform for Effective Transform, e.g. "rotate(90deg)". */
  transformCss?: string | null;
  content: string | null;
  /** MediaFile already uploaded in a previous attempt; skips the upload. */
  pendingMediaId?: string | null;
  onStage?: (stage: PublishStage) => void;
  onUploadProgress?: (percent: number) => void;
}

export interface PublishResult {
  post: PostResponseDto;
  /** Confirmed MediaFile id, or null for text-only Posts. */
  mediaFileId: string | null;
}

/** Publish failure carrying which stage failed and any confirmed media. */
export class PostPublishError extends Error {
  constructor(
    message: string,
    public readonly stage: PublishStage,
    public readonly cause?: unknown,
    public readonly uploadedMediaId?: string
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
    const imageSrc = (params.imageSrc ?? '').trim();
    const hasImage = imageSrc.length > 0;

    if (!hasImage && !content && !params.pendingMediaId) {
      throw new PostPublishError('Cannot publish empty post', 'creating');
    }

    const mediaFileId: string | null = params.pendingMediaId
      ? await this.reusePendingMedia(params.pendingMediaId)
      : hasImage
        ? await this.uploadImage({
            ...params,
            imageSrc,
            filterCss: params.filterCss ?? '',
          })
        : null;

    params.onStage?.('creating');

    const dto: CreatePostRequestDto = {
      content,
      mediaIds: mediaFileId ? [mediaFileId] : [],
    };

    try {
      const post = await firstValueFrom(this.postsApi.createPost(dto));
      return { post, mediaFileId };
    } catch (error) {
      // Media is confirmed on the server but the post failed:
      // surface it so the caller can retry reusing it or clean it up.
      // Text-only failures carry no media (undefined).
      throw new PostPublishError(
        'Post creation failed',
        'creating',
        error,
        mediaFileId ?? undefined
      );
    }
  }

  private async reusePendingMedia(mediaFileId: string): Promise<string> {
    this.logger.debug('Reusing previously uploaded media for retry', {
      context: 'PostPublishService',
      data: { mediaFileId },
    });
    return mediaFileId;
  }

  private async uploadImage(
    params: Omit<PublishParams, 'imageSrc' | 'filterCss'> & {
      imageSrc: string;
      filterCss: string;
    }
  ): Promise<string> {
    let file;

    try {
      params.onStage?.('baking');
      file = await bakeImageFilter(params.imageSrc, params.filterCss, {
        transform: params.transformCss ?? null,
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
      params.onStage?.('uploading');
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
      // uploadToStorage emits one value per progress tick plus a final 100 on
      // load: wait for completion, not the first tick. firstValueFrom here
      // resolved early, unsubscribed, and the teardown aborted the PUT
      // mid-flight, so confirm then failed with 422 "File does not exist".
      await lastValueFrom(
        this.uploadApi.uploadToStorage(
          presigned.uploadUrl,
          file,
          (percent) => params.onUploadProgress?.(percent)
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
      // The backend verifies the object reached storage at confirm time, so a
      // failure here means no MediaFile exists yet: the retry must re-upload
      // from scratch (no uploadedMediaId), unlike 'creating' failures which
      // reuse the confirmed media via pendingMediaId.
      throw new PostPublishError(
        'Upload confirmation failed',
        'uploading',
        error
      );
    }
  }
}
