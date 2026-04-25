export interface GeneratePresignedUrlDto {
  mimeType: string;
  originalName: string;
  size: number;
}

export interface PresignedUrlResponseDto {
  id: string;
  key: string;
  uploadUrl: string;
}

export interface ConfirmUploadDto {
  fileId: string;
  key: string;
  mimeType: string;
  originalName: string;
  size: number;
}

export interface MediaFileResponseDto {
  id: string;
  key: string;
  publicUrl: string;
  mimeType: string;
  size: number;
  ownerId: string;
}

export interface DeleteMediaResponseDto {
  success: boolean;
}
