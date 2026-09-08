/**
 * Canonical Post DTOs mirroring the backend API contract (Help Api v1).
 * See POST /api/v1/posts and /api/v1/posts/{id} in the swagger spec.
 */

export type PostStatus = 'published' | 'draft' | 'scheduled';

export interface MediaReferenceResponseDto {
  id: string;
  mediaFileId: string;
  position: number;
  publicUrl: string;
  mimeType: string;
}

export interface PostResponseDto {
  id: string;
  authorId: string;
  content: string | null;
  media: MediaReferenceResponseDto[];
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedPostsResponseDto {
  items: PostResponseDto[];
  nextCursor: string | null;
  total?: number;
}

export interface CreatePostRequestDto {
  content?: string | null;
  mediaIds?: string[] | null;
}
