import { mapError } from '../../../core/errors/error-mapper';
import { AppError } from '../../../core/models/app-error.model';
import { PROFILE_ERROR_MAP, ProfileErrorContext } from './profile-error.config';

export function handleProfileError(
  error: AppError,
  context: ProfileErrorContext
): string {
  return mapError(error, PROFILE_ERROR_MAP[context]);
}
