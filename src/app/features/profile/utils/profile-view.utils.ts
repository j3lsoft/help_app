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
  videosCount: string;
  followersCount: string;
  followingCount: string;
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
  videosCount?: string | number;
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
    videosCount: String(params.videosCount ?? '0'),
    followersCount: String(params.followerCount),
    followingCount: String(params.followingCount),
  };
}
