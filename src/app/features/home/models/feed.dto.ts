/**
 * DTOs for the Home Feed read endpoint (`GET /api/v1/feed`).
 *
 * The feed item is a distinct shape from `PostResponseDto`: it embeds the
 * author and carries no engagement totals nor hashtags, so the feed projects
 * it through its own adapter.
 */

export interface FeedAuthorResponseDto {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface FeedMediaResponseDto {
  id: string;
  mediaFileId: string;
  position: number;
  publicUrl: string;
  mimeType: string;
}

export interface FeedItemResponseDto {
  id: string;
  content: string | null;
  status: 'published';
  createdAt: string;
  updatedAt: string;
  media: FeedMediaResponseDto[];
  author: FeedAuthorResponseDto;
}

export interface PaginatedFeedResponseDto {
  items: FeedItemResponseDto[];
  nextCursor: string | null;
  /** Only present when `includeTotal` was requested. */
  total?: number;
}
