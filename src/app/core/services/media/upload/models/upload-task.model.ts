export enum UploadStatus {
  PENDING = 'pending',
  UPLOADING = 'uploading',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum UploadPhase {
  REQUEST_URL = 'request_url',
  UPLOAD = 'upload',
  PROCESSING = 'processing',
  CONFIRM = 'confirm',
}

export interface UploadTask {
  id: string;
  file: File;
  status: UploadStatus;
  phase: UploadPhase;
  progress: number;
  error: UploadError | null;
  result: UploadResult | null;
  strategy: 'direct' | 'presigned';
  uploadType: UploadType;
  createdAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
}

export interface UploadResult {
  id: string;
  key: string;
  publicUrl: string;
  mimeType: string;
  size: number;
  ownerId: string;
}

export interface UploadError {
  code: string;
  message: string;
  retryable: boolean;
  statusCode?: number;
}

export type UploadType =
  | 'avatar'
  | 'post_image'
  | 'post_video'
  | 'story'
  | 'generic';
