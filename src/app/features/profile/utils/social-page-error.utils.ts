import { EMPTY, catchError } from 'rxjs';
import { toAppError } from '@core/utils/app-error.utils';
import type { ErrorMessageFacade } from '@core/errors/facades/error.facade';
import { SOCIAL_ERROR_MAP, SocialErrorContext } from '../errors/social-error.config';

export function catchSocialError(
  facade: ErrorMessageFacade,
  context: SocialErrorContext,
  onError?: (error: unknown) => void
) {
  return catchError((error: unknown) => {
    onError?.(error);
    facade.handle(toAppError(error), SOCIAL_ERROR_MAP[context]);
    return EMPTY;
  });
}

export function followActionContext(
  isFollowing: boolean
): 'follow' | 'unfollow' {
  return isFollowing ? 'unfollow' : 'follow';
}
