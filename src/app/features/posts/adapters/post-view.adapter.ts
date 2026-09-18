import { PostResponseDto } from '../models/post.dto';
import { Post, PostAuthor } from '../models/post-view.model';

/** Author context and optional local fallbacks for one projection. */
export interface PostViewOptions {
  author: PostAuthor | null;
  /** Per-index local media (e.g. composer blob urls) when the API has none. */
  fallbackImageUrls?: string | string[];
}

/** One media piece of one Post, in carousel position order. */
export interface PostImageRef {
  postId: string;
  image: string;
  index: number;
}

function normalizeFallbackUrls(fallback: string | string[] | undefined): string[] {
  if (fallback === undefined) return [];
  return Array.isArray(fallback) ? fallback : [fallback];
}

/** Ordered carousel URLs from API media, with optional per-index local fallbacks. */
export function postImageUrls(
  dto: PostResponseDto,
  fallbackImageUrls?: string | string[],
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
 * Flattens every media piece of every Post into one ordered list, so callers
 * that need both URLs and per-image entries walk the posts only once.
 */
export function collectPostImages(posts: PostResponseDto[]): PostImageRef[] {
  return posts.reduce<PostImageRef[]>((refs, post) => {
    postImageUrls(post).forEach((image, index) => {
      refs.push({ postId: post.id, image, index });
    });
    return refs;
  }, []);
}

/**
 * Maps a server Post + session author data to the feed view-model.
 * The API does not embed author info in PostResponseDto, so it comes
 * from the authenticated session (v1: users only see their own new posts).
 */
export function toPostView(dto: PostResponseDto, options: PostViewOptions): Post {
  const { author } = options;
  const postImages = postImageUrls(dto, options.fallbackImageUrls);
  const postImage = postImages[0] ?? '';

  return {
    id: dto.id,
    userProfilePic: author?.avatarUrl || '',
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
