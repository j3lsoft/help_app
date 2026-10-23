/**
 * Canonical Post DTOs mirroring the backend API contract (Help Api v1).
 * See POST /api/v1/posts and /api/v1/posts/{id} in the swagger spec.
 */

type PostStatus = 'published' | 'draft' | 'scheduled';

interface MediaReferenceResponseDto {
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
  /** Hashtags extracted from the content at write time (lowercased, max 10). */
  hashtags: string[];
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedPostsResponseDto {
  items: PostResponseDto[];
  nextCursor: string | null;
  total?: number;
}

/** `GET /api/v1/posts/hashtags/suggest` — matching tags without the leading `#`. */
export interface HashtagSuggestionsResponseDto {
  items: string[];
}

export interface CreatePostRequestDto {
  content?: string | null;
  mediaIds?: string[] | null;
}

export interface EditPostRequestDto {
  content?: string | null;
  mediaIds?: string[] | null;
}
