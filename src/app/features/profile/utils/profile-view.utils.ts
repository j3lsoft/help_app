import { PostResponseDto } from '@features/posts/models/post.dto';
import { PostItem } from '../models/post-item.model';
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
 * Maps a Post DTO to the profile grid item, using the first media's publicUrl.
 * Falls back to a placeholder when no media or publicUrl is available.
 */
export function toPostItem(post: PostResponseDto): PostItem {
  return {
    id: post.id,
    image:
      post.media?.[0]?.publicUrl || 'assets/images/gallery/gallery1.png',
    createdAt: post.createdAt,
  };
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
