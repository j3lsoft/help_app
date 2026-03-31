import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ApiErrorService } from './api-error.service';
import { extractBackendMessage } from '../utils/error.utils';

/**
 * Centralized error handler for the application.
 * Maps global cross-cutting HTTP errors to user-friendly messages.
 * Feature-specific map logic (like Auth) should be handled by the features directly.
 */
@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  private readonly apiErrorService = inject(ApiErrorService);

  /**
   * Maps an HTTP error to a user-friendly message.
   * Promotes extensibility by letting features handle their own domains.
   *
   * @param error The error object (typically HttpErrorResponse)
   * @returns User-friendly error message
   */
  mapError(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'Something went wrong. Please try again.';
    }

    if (error.status === 0) {
      return 'Network error. Please check your connection and try again.';
    }
    if (error.status >= 500) {
      return 'Server error. Please try again later.';
    }
    if (error.status === 429) {
      return 'Too many requests. Please try again later.';
    }

    const errorCode = this.apiErrorService.extractCode(error);
    if (errorCode && this.apiErrorService.isKnownError(errorCode)) {
      return this.apiErrorService.getMessage(errorCode);
    }

    return this.mapGenericError(error);
  }

  private mapGenericError(error: HttpErrorResponse): string {
    return (
      extractBackendMessage(error) ||
      'Something went wrong. Please try again.'
    );
  }
}
