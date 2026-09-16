import { Post } from '@features/home/components/post-card/post-card.component';
import { PostResponseDto } from '../models/post.dto';

const DEFAULT_USER_AVATAR = 'assets/images/users/user43.png';

/**
 * Minimal author fields needed to render a feed Post. Satisfied by both the
 * authenticated `AuthUserDto` (own posts) and `PublicProfileResponseDto`
 * (another user's Profile Posts).
 */
export interface PostAuthor {
  displayName?: string | null;
  username?: string | null;
  avatarUrl?: string | null;
}

function normalizeFallbackUrls(fallback: string | string[] | undefined): string[] {
  if (fallback === undefined) return [];
  return Array.isArray(fallback) ? fallback : [fallback];
}

/** Ordered carousel URLs from API media, with optional per-index local fallbacks. */
export function resolvePostImageUrls(
  dto: PostResponseDto,
  fallbackImageUrls?: string | string[]
): string[] {
  const fallbacks = normalizeFallbackUrls(fallbackImageUrls);
  const sorted = [...dto.media].sort((a, b) => a.position - b.position);

  if (sorted.length === 0) {
    return fallbacks.filter((url) => url.length > 0);
  }

  const urls = sorted.map((ref, index) => {
    const fromApi = ref.publicUrl?.trim() ?? '';
    if (fromApi.length > 0) {
      return fromApi;
    }
    return fallbacks[index] ?? fallbacks[0] ?? '';
  });

  return urls.filter((url) => url.length > 0);
}

/**
 * Maps a server Post + session author data to the feed view-model.
 * The API does not embed author info in PostResponseDto, so it comes
 * from the authenticated session (v1: users only see their own new posts).
 */
export function toFeedPost(
  dto: PostResponseDto,
  author: PostAuthor | null,
  fallbackImageUrls?: string | string[]
): Post {
  const postImages = resolvePostImageUrls(dto, fallbackImageUrls);
  const postImage = postImages[0] ?? '';

  return {
    id: dto.id,
    userProfilePic: author?.avatarUrl || DEFAULT_USER_AVATAR,
    userName: author?.displayName || author?.username || 'You',
    username: author?.username ?? '',
    aboutPost: dto.content ?? '',
    createdAt: dto.createdAt,
    postLikes: '0',
    postComments: '0',
    postShares: '0',
    postSaves: '0',
    postSaved: false,
    postImage,
    postImages,
    postLike: false,
  };
}
