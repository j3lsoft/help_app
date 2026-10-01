import { UploadType } from './media-upload.model';

/** Byte and MIME ceiling enforced for one `UploadType` before uploading. */
export interface UploadLimit {
  maxBytes: number;
  allowedMimeTypes: string[];
}

export interface UploadConfig {
  /** Validation limits per upload type. */
  limits: Record<UploadType, UploadLimit>;
  /** Number of retries after the first attempt. */
  retryAttempts: number;
  /** Base delay in ms; doubles on every retry. */
  retryDelay: number;
}
