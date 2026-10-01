import { Injectable, inject } from '@angular/core';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { LoggerService } from '../../../logger.service';
import { isTechnicalError } from '../../../../utils/http.utils';
import {
  MediaUploadError,
  MediaUploadOptions,
  UploadResult,
  UploadType,
} from '../models';
import { UPLOAD_CONFIG } from '../upload.token';
import { UploadApiService } from './upload-api.service';

/** Progress reported right after the presigned URL is resolved. */
const PRESIGN_PROGRESS = 5;
/** Share of the bar owned by the storage PUT, between {@link PRESIGN_PROGRESS} and 100. */
const STORAGE_WEIGHT = 90;

/**
 * Uploads one media file through the presigned flow (request URL → storage PUT
 * → confirm), with per-type validation and retry. Callers that need to publish
 * a batch of files own the concurrency and the per-index failure mapping; this
 * module only guarantees that a single file either lands or reports why.
 */
@Injectable({ providedIn: 'root' })
export class MediaUpload {
  private readonly api = inject(UploadApiService);
  private readonly config = inject(UPLOAD_CONFIG);
  private readonly logger = inject(LoggerService);

  async upload(file: File, options: MediaUploadOptions): Promise<UploadResult> {
    this.validate(file, options.uploadType);
    return this.withRetry(
      () => this.performUpload(file, options.uploadType, options.onProgress),
      options.uploadType,
    );
  }

  /** Removes a MediaFile from storage (e.g. when a draft is discarded). */
  async remove(fileId: string): Promise<void> {
    await firstValueFrom(this.api.deleteFile(fileId));
  }

  private validate(file: File, uploadType: UploadType): void {
    const limit = this.config.limits[uploadType];
    if (!limit) {
      throw new MediaUploadError(
        'upload_type_unknown',
        `No upload limit configured for type "${uploadType}".`,
        false,
      );
    }
    if (file.size > limit.maxBytes) {
      const maxMb = (limit.maxBytes / 1024 / 1024).toFixed(1);
      throw new MediaUploadError(
        'file_too_large',
        `File exceeds the ${maxMb}MB limit for ${uploadType}.`,
        false,
      );
    }
    if (!limit.allowedMimeTypes.includes(file.type)) {
      throw new MediaUploadError(
        'file_type_not_allowed',
        `File type "${file.type}" is not allowed for ${uploadType}.`,
        false,
      );
    }
  }

  private async performUpload(
    file: File,
    uploadType: UploadType,
    onProgress?: (percent: number) => void,
  ): Promise<UploadResult> {
    onProgress?.(0);

    let presigned;
    try {
      presigned = await firstValueFrom(
        this.api.getPresignedUrl({
          mimeType: file.type,
          originalName: file.name,
          size: file.size,
        }),
      );
    } catch (error) {
      throw this.toMediaUploadError(error, 'presigned_url_failed');
    }
    onProgress?.(PRESIGN_PROGRESS);

    try {
      await lastValueFrom(
        this.api.uploadToStorage(presigned.uploadUrl, file, (percent) => {
          onProgress?.(
            PRESIGN_PROGRESS + Math.round((percent / 100) * STORAGE_WEIGHT),
          );
        }),
      );
    } catch (error) {
      throw this.toMediaUploadError(error, 'storage_upload_failed');
    }

    let media;
    try {
      media = await firstValueFrom(
        this.api.confirmUpload({
          fileId: presigned.id,
          key: presigned.key,
          mimeType: file.type,
          originalName: file.name,
          size: file.size,
        }),
      );
    } catch (error) {
      throw this.toMediaUploadError(error, 'confirmation_failed');
    }

    onProgress?.(100);
    return {
      id: media.id,
      key: media.key,
      publicUrl: media.publicUrl,
      mimeType: media.mimeType,
      size: media.size,
      ownerId: media.ownerId,
    };
  }

  private async withRetry(
    run: () => Promise<UploadResult>,
    uploadType: UploadType,
  ): Promise<UploadResult> {
    const retries = Math.max(0, this.config.retryAttempts);
    let lastError: MediaUploadError | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await run();
      } catch (error) {
        const mediaError = this.toMediaUploadError(error);
        lastError = mediaError;
        if (!mediaError.retryable || attempt === retries) {
          throw mediaError;
        }
        this.logRetry(mediaError, uploadType, attempt + 1);
        await delay(this.config.retryDelay * 2 ** attempt);
      }
    }

    throw lastError;
  }

  private logRetry(
    error: MediaUploadError,
    uploadType: UploadType,
    attempt: number,
  ): void {
    const options = {
      context: 'MediaUpload',
      data: { uploadType, code: error.code, attempt },
    };
    // Network (0) and 5xx are technical failures → ERROR; the rest WARN.
    if (isTechnicalError(error.statusCode)) {
      this.logger.error('Upload failed; retrying', options);
    } else {
      this.logger.warn('Upload failed; retrying', options);
    }
  }

  private toMediaUploadError(
    error: unknown,
    fallbackCode = 'upload_failed',
  ): MediaUploadError {
    if (error instanceof MediaUploadError) {
      return error;
    }
    const source = error as {
      status?: number;
      statusCode?: number;
      message?: string;
    } | null;
    const statusCode = source?.status ?? source?.statusCode ?? 0;
    // The phase code is this module's contract; a generic adapter code from
    // upstream would overwrite it with something less specific.
    return new MediaUploadError(
      fallbackCode,
      source?.message ?? 'Upload failed',
      statusCode !== 401 && statusCode !== 403,
      statusCode,
    );
  }
}

function delay(ms: number): Promise<void> {
  if (ms <= 0) {
    return Promise.resolve();
  }
  return new Promise((resolve) => setTimeout(resolve, ms));
}
