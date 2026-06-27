import { ErrorMapConfig } from '../../../core/errors/error-map.interface';

export type SocialErrorContext =
  | 'follow'
  | 'unfollow'
  | 'followers'
  | 'followings'
  | 'suggestions'
  | 'follow-status'
  | 'follow-counts';

const SESSION_EXPIRED_MESSAGE = 'Session expired. Please login again.';

export const SOCIAL_ERROR_MAP: Record<SocialErrorContext, ErrorMapConfig> = {
  follow: {
    byCode: {
      cannot_follow_self: 'Cannot follow yourself.',
      followee_not_found: 'Target user does not exist.',
      already_following: 'Already following this user.',
    },
    byStatus: {
      401: SESSION_EXPIRED_MESSAGE,
      404: 'Target user does not exist.',
      409: 'Already following this user.',
    },
    fallback: 'Failed to follow user. Please try again.',
  },
  unfollow: {
    byCode: {
      cannot_follow_self: 'Cannot unfollow yourself.',
      not_following: 'Not following this user.',
    },
    byStatus: {
      401: SESSION_EXPIRED_MESSAGE,
      404: 'Not following this user.',
      422: 'Cannot unfollow yourself.',
    },
    fallback: 'Failed to unfollow user. Please try again.',
  },
  followers: {
    byCode: {
      user_not_found: 'Target user does not exist.',
    },
    byStatus: {
      404: 'Target user does not exist.',
    },
    fallback: 'Failed to load followers. Please try again.',
  },
  followings: {
    byCode: {
      user_not_found: 'Target user does not exist.',
    },
    byStatus: {
      404: 'Target user does not exist.',
    },
    fallback: 'Failed to load following. Please try again.',
  },
  suggestions: {
    byStatus: {
      401: SESSION_EXPIRED_MESSAGE,
    },
    fallback: 'Failed to load suggestions. Please try again.',
  },
  'follow-status': {
    byCode: {
      user_not_found: 'Target user does not exist.',
    },
    byStatus: {
      401: SESSION_EXPIRED_MESSAGE,
      404: 'Target user does not exist.',
    },
    fallback: 'Failed to check follow status. Please try again.',
  },
  'follow-counts': {
    byCode: {
      user_not_found: 'Target user does not exist.',
    },
    byStatus: {
      404: 'Target user does not exist.',
    },
    fallback: 'Failed to load follow counts. Please try again.',
  },
};
