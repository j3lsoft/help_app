import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

/**
 * Context for authentication-related errors.
 */
export type AuthErrorContext =
  | 'login'
  | 'register'
  | 'password-reset'
  | 'password-change'
  | 'verification';

/**
 * Centralized error handler for the application.
 * Provides consistent error mapping and user-friendly messages.
 */
@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  /**
   * Maps authentication errors to user-friendly messages.
   * @param error The error object (typically HttpErrorResponse)
   * @param context The context in which the error occurred
   * @returns User-friendly error message
   */
  mapAuthError(error: unknown, context: AuthErrorContext): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'Something went wrong. Please try again.';
    }

    switch (context) {
      case 'login':
        return this.mapLoginError(error);
      case 'register':
        return this.mapRegisterError(error);
      case 'password-reset':
        return this.mapPasswordResetError(error);
      case 'password-change':
        return this.mapPasswordChangeError(error);
      case 'verification':
        return this.mapVerificationError(error);
      default:
        return this.mapGenericError(error);
    }
  }

  private mapLoginError(error: HttpErrorResponse): string {
    if (error.status === 401) {
      return 'Invalid email or password.';
    }
    if (error.status === 403) {
      return 'Please verify your email before logging in.';
    }
    return this.mapGenericError(error);
  }

  private mapRegisterError(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'Network error. Please try again.';
    }
    if (error.status === 409) {
      const msg =
        typeof error.error?.message === 'string' ? error.error.message : '';
      const lower = msg.toLowerCase();
      if (lower.includes('username')) {
        return 'The username is not available';
      }
      if (lower.includes('email')) {
        return 'The email is already registered';
      }
      return 'Email or username already exists';
    }
    if (error.status === 400) {
      return 'Invalid data. Please review the form.';
    }

    const backendMessage =
      typeof error.error?.message === 'string' ? error.error.message : '';
    return backendMessage
      ? backendMessage
      : `Something went wrong. Please try again. (${error.status})`;
  }

  private mapPasswordResetError(error: HttpErrorResponse): string {
    return this.mapGenericError(error);
  }

  private mapPasswordChangeError(error: HttpErrorResponse): string {
    return this.mapGenericError(error);
  }

  private mapVerificationError(error: HttpErrorResponse): string {
    return this.mapGenericError(error);
  }

  private mapGenericError(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'Network error. Please check your connection and try again.';
    }
    if (error.status >= 500) {
      return 'Server error. Please try again later.';
    }
    const backendMessage =
      typeof error.error?.message === 'string' ? error.error.message : '';
    return backendMessage || 'Something went wrong. Please try again.';
  }
}
