import { collectPostImages } from '@features/posts/adapters/post-view.adapter';
import { PostResponseDto } from '@features/posts/models/post.dto';
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

/** Ordered media of every post, projected for the profile Media tab. */
export interface ProfileMedia {
  /** Grid entries with a unique key per post+position for `@for` tracking. */
  items: ProfileMediaItem[];
  /** Same order as `items`, for the fullscreen lightbox. */
  urls: string[];
}

/**
 * Flattens every media item of every post in a single walk. Media keeps post
 * order (newest first) and each post's own position order.
 */
export function toProfileMedia(posts: PostResponseDto[]): ProfileMedia {
  const items: ProfileMediaItem[] = collectPostImages(posts).map((ref) => ({
    key: `${ref.postId}#${ref.index}`,
    image: ref.image,
    postId: ref.postId,
  }));
  return { items, urls: items.map((item) => item.image) };
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
