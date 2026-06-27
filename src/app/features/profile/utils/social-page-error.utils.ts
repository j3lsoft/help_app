import { EMPTY, catchError } from 'rxjs';
import { toAppError } from '@core/utils/app-error.utils';
import { SocialErrorContext } from '../errors/social-error.config';
import { SocialErrorFacade } from '../errors/social-error.facade';

export function catchSocialError(
  facade: SocialErrorFacade,
  context: SocialErrorContext,
  onError?: (error: unknown) => void
) {
  return catchError((error: unknown) => {
    onError?.(error);
    facade.handle(toAppError(error), context);
    return EMPTY;
  });
}

export function followActionContext(
  isFollowing: boolean
): 'follow' | 'unfollow' {
  return isFollowing ? 'unfollow' : 'follow';
}
