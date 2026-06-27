import { mapError } from '../../../core/errors/error-mapper';
import { AppError } from '../../../core/models/app-error.model';
import { SOCIAL_ERROR_MAP, SocialErrorContext } from './social-error.config';

export function handleSocialError(
  error: AppError,
  context: SocialErrorContext
): string {
  return mapError(error, SOCIAL_ERROR_MAP[context]);
}
