import { mapError } from '../../../core/errors/error-mapper';
import { AppError } from '../../../core/models/app-error.model';
import { AUTH_ERROR_MAP, AuthErrorContext } from './auth-error.config';

export function handleAuthError(
  error: AppError,
  context: AuthErrorContext
): string {
  return mapError(error, AUTH_ERROR_MAP[context]);
}
