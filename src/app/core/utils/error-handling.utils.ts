import { AppError } from '../models/app-error.model';

const SERVER_ERROR_THRESHOLD = 500;

/**
 * Classifies technical errors and returns a user-friendly message.
 */
export function classifyTechnicalError(
  error: AppError,
  options: { isOnline: boolean }
): string | null {
  if (error.status === 0) {
    return options.isOnline
      ? 'Network error. Please check your connection.'
      : 'You appear to be offline. Please check your connection.';
  }

  if (error.status === 429) {
    return 'Too many requests. Please try again later.';
  }

  if (error.status >= SERVER_ERROR_THRESHOLD) {
    return 'Server error. Please try again later.';
  }

  return null;
}
