export interface CompressionRule {
  maxSizeMB: number;
  maxWidthOrHeight: number;
  quality?: number;
}

export interface UploadConfig {
  maxFileSize: number;
  allowedMimeTypes: string[];
  allowedExtensions?: string[];
  maxConcurrentUploads: number;
  strategy: 'direct' | 'presigned';
  retryAttempts: number;
  retryDelay: number;
  compression?: {
    enabled: boolean;
    rules: Record<string, CompressionRule | null>;
  };
}
