/** The kind of media being uploaded; selects the validation limits. */
export type UploadType =
  | 'avatar'
  | 'post_image'
  | 'post_video'
  | 'story'
  | 'generic';

/** A confirmed MediaFile as returned by the media API. */
export interface UploadResult {
  id: string;
  key: string;
  publicUrl: string;
  mimeType: string;
  size: number;
  ownerId: string;
}

/** Options accepted by `MediaUpload.upload`. */
export interface MediaUploadOptions {
  /** The kind of media, used to validate size and MIME type. */
  uploadType: UploadType;
  /** Receives progress 0..100 while the file uploads. */
  onProgress?: (percent: number) => void;
}

/**
 * Rejection from `MediaUpload`. `retryable` is false for validation failures
 * and for conclusive credentials errors (401/403); any other failure is
 * retried.
 */
export class MediaUploadError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly retryable: boolean,
    public readonly statusCode = 0,
  ) {
    super(message);
    this.name = 'MediaUploadError';
  }
}
