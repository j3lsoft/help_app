import { PostResponseDto } from '@features/posts/models/post.dto';
import { resolvePostImageUrls } from '@features/posts/utils/post-view.adapter';
import { ProfileMediaItem } from '../models/profile-media-item.model';
import {
  normalizeWebsiteUrl,
  stripWebsiteProtocol,
} from './website-url.utils';

export interface ProfileHeaderViewModel {
  username: string;
  name: string;
  description: string;
  website: string;
  fullWebsiteUrl: string;
  profileImage: string;
  postsCount: string;
  followersCount: string;
  followingCount: string;
}

/**
 * Flattens every media item of every post into a single ordered list for the
 * profile Media tab. Media keeps post order (newest first) and each post's
 * own position order, and each item carries a unique key for `@for` tracking.
 */
export function toProfileMediaItems(
  posts: PostResponseDto[],
): ProfileMediaItem[] {
  return posts.reduce<ProfileMediaItem[]>((items, post) => {
    const media = resolvePostImageUrls(post).map((image, index) => ({
      key: `${post.id}#${index}`,
      image,
      postId: post.id,
    }));
    return [...items, ...media];
  }, []);
}

/** Ordered media URLs across all posts, for the fullscreen lightbox. */
export function resolveProfileMediaUrls(posts: PostResponseDto[]): string[] {
  return posts.reduce<string[]>(
    (urls, post) => [...urls, ...resolvePostImageUrls(post)],
    [],
  );
}

interface ProfileSourceFields {
  username?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  website?: string | null;
}

export function toProfileHeaderViewModel(params: {
  source: ProfileSourceFields;
  fullProfile?: ProfileSourceFields | null;
  followerCount: number;
  followingCount: number;
  postsCount?: string | number;
}): ProfileHeaderViewModel {
  const { source, fullProfile } = params;

  return {
    username: source.username ?? '',
    name: source.displayName ?? '',
    description: fullProfile?.bio ?? '',
    website: stripWebsiteProtocol(fullProfile?.website ?? ''),
    fullWebsiteUrl: normalizeWebsiteUrl(fullProfile?.website ?? ''),
    profileImage: source.avatarUrl ?? '',
    postsCount: String(params.postsCount ?? '0'),
    followersCount: String(params.followerCount),
    followingCount: String(params.followingCount),
  };
}
