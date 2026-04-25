import { AppError } from '../models/app-error.model';

export function isAppError(value: unknown): value is AppError {
  if (!value || typeof value !== 'object') return false;
  const maybe = value as Partial<AppError>;
  return typeof maybe.status === 'number' && typeof maybe.handled === 'boolean';
}

export function isHandled(error: AppError): boolean {
  return error.handled === true;
}

export function markHandled<T extends AppError>(error: T): T {
  error.handled = true;
  return error;
}

export function toAppError(value: unknown): AppError {
  if (isAppError(value)) {
    return value;
  }

  if (value instanceof Error) {
    return {
      status: 0,
      code: 'UNEXPECTED_ERROR',
      message: value.message,
      details: { cause: value.name },
      handled: false,
    };
  }

  return {
    status: 0,
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred.',
    details: { value: String(value) },
    handled: false,
  };
}

