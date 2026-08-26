import { ErrorMapConfig } from '../../../core/errors/error-map.interface';

export type PostErrorContext = 'publish';

const SESSION_EXPIRED_MESSAGE = 'Session expired. Please login again.';

export const POST_ERROR_MAP: Record<PostErrorContext, ErrorMapConfig> = {
  publish: {
    byCode: {
      media_not_owned: 'You can only attach media you own.',
      media_not_found: 'The attached image no longer exists.',
    },
    byStatus: {
      401: SESSION_EXPIRED_MESSAGE,
      403: 'You can only attach media you own.',
      404: 'The attached image no longer exists.',
      422: 'Check your caption and try again.',
    },
    fallback: 'Failed to publish the post. Please try again.',
  },
};
