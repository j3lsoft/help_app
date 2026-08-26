import { mapError } from '../../../core/errors/error-mapper';
import { AppError } from '../../../core/models/app-error.model';
import { POST_ERROR_MAP, PostErrorContext } from './post-error.config';

export function handlePostError(
  error: AppError,
  context: PostErrorContext
): string {
  return mapError(error, POST_ERROR_MAP[context]);
}
