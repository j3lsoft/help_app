import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { LoggerService } from '../../../core/services/logger.service';
import { UploadApiService } from '../../../core/services/media/upload/services/upload-api.service';
import { CreatePostRequestDto, PostResponseDto } from '../models/post.dto';
import { bakeImageFilter } from '../utils/image-bake.util';
import { PostsApiService } from './posts-api.service';

export type PublishStage = 'baking' | 'uploading' | 'creating';

export interface PublishParams {
  /** WebView-loadable URL of the selected image. */
  imageSrc: string;
  filterCss: string;
  content: string | null;
  /** MediaFile already uploaded in a previous attempt; skips the upload. */
  pendingMediaId?: string | null;
  onStage?: (stage: PublishStage) => void;
  onUploadProgress?: (percent: number) => void;
}

export interface PublishResult {
  post: PostResponseDto;
  mediaFileId: string;
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
    const mediaFileId = params.pendingMediaId
      ? await this.reusePendingMedia(params.pendingMediaId)
      : await this.uploadImage(params);

    params.onStage?.('creating');

    const dto: CreatePostRequestDto = {
      content: params.content?.trim() ? params.content.trim() : null,
      mediaIds: [mediaFileId],
    };

    try {
      const post = await firstValueFrom(this.postsApi.createPost(dto));
      return { post, mediaFileId };
    } catch (error) {
      // Media is confirmed on the server but the post failed:
      // surface it so the caller can retry reusing it or clean it up.
      throw new PostPublishError(
        'Post creation failed',
        'creating',
        error,
        mediaFileId
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

  private async uploadImage(params: PublishParams): Promise<string> {
    let file;

    try {
      params.onStage?.('baking');
      file = await bakeImageFilter(params.imageSrc, params.filterCss);
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
      await firstValueFrom(
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
      throw new PostPublishError(
        'Upload confirmation failed',
        'uploading',
        error
      );
    }
  }
}
