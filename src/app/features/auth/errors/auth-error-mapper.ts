import { HttpErrorResponse } from '@angular/common/http';
import { ApiErrorCode, ApiErrorService } from 'src/app/core/services/api-error.service';
import { extractBackendMessage } from 'src/app/core/utils/error.utils';

export type AuthErrorContext =
  | 'login'
  | 'register'
  | 'password-reset'
  | 'password-change'
  | 'verification';

export class AuthErrorMapper {
  private static apiErrorService = new ApiErrorService();

  static map(error: unknown, context: AuthErrorContext): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'Something went wrong. Please try again.';
    }

    if (error.status === 0 || error.status >= 500 || error.status === 429) {
      return 'An unexpected communication error occurred. Please try again.';
    }

    const errorCode = this.apiErrorService.extractCode(error);

    if (errorCode && this.apiErrorService.isKnownError(errorCode)) {
      return this.apiErrorService.getMessage(errorCode);
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

  private static mapLoginError(error: HttpErrorResponse): string {
    const code = this.apiErrorService.extractCode(error);

    if (code === ApiErrorCode.INVALID_CREDENTIALS) {
      return 'Invalid email or password.';
    }
    if (code === ApiErrorCode.ACCOUNT_NOT_VERIFIED) {
      return 'Please verify your email before logging in.';
    }
    if (code === ApiErrorCode.ACCOUNT_LOCKED) {
      return 'Your account has been locked. Please contact support.';
    }
    if (error.status === 401) {
      return 'Invalid email or password.';
    }
    if (error.status === 403) {
      return 'Please verify your email before logging in.';
    }
    return this.mapGenericError(error);
  }

  private static mapRegisterError(error: HttpErrorResponse): string {
    const code = this.apiErrorService.extractCode(error);

    if (code === ApiErrorCode.USER_ALREADY_EXISTS) {
      const msg = extractBackendMessage(error).toLowerCase();
      if (msg.includes('username')) {
        return 'The username is not available.';
      }
      return 'An account with this email already exists.';
    }
    if (error.status === 409) {
      const msg = extractBackendMessage(error).toLowerCase();
      if (msg.includes('username')) {
        return 'The username is not available.';
      }
      if (msg.includes('email')) {
        return 'An account with this email already exists.';
      }
      return 'Email or username already exists.';
    }
    if (error.status === 400) {
      return 'Invalid data. Please review the form.';
    }
    return this.mapGenericError(error);
  }

  private static mapPasswordResetError(error: HttpErrorResponse): string {
    const code = this.apiErrorService.extractCode(error);

    if (code === ApiErrorCode.INVALID_OTP) {
      return 'Invalid verification code.';
    }
    if (code === ApiErrorCode.EXPIRED_OTP) {
      return 'Verification code has expired. Please request a new one.';
    }
    if (code === ApiErrorCode.MAX_OTP_ATTEMPTS_EXCEEDED) {
      return 'Too many attempts. Please request a new code.';
    }
    if (error.status === 422) {
      return 'Please enter a valid email address.';
    }
    if (error.status === 400) {
      return extractBackendMessage(error) || 'Invalid request.';
    }
    return this.mapGenericError(error);
  }

  private static mapPasswordChangeError(error: HttpErrorResponse): string {
    const code = this.apiErrorService.extractCode(error);

    if (code === ApiErrorCode.INVALID_CURRENT_PASSWORD) {
      return 'Current password is incorrect.';
    }
    if (code === ApiErrorCode.INVALID_NEW_PASSWORD) {
      return 'New password does not meet requirements.';
    }
    if (code === ApiErrorCode.INVALID_CHANGE_PASSWORD_TOKEN) {
      return 'Invalid password reset token.';
    }
    if (code === ApiErrorCode.EXPIRED_CHANGE_PASSWORD_TOKEN) {
      return 'Password reset token has expired.';
    }
    if (error.status === 400) {
      return 'Invalid or expired change token.';
    }
    if (error.status === 422) {
      return 'Validation failed. Please check your input.';
    }
    return this.mapGenericError(error);
  }

  private static mapVerificationError(error: HttpErrorResponse): string {
    const code = this.apiErrorService.extractCode(error);

    if (code === ApiErrorCode.INVALID_OTP) {
      return 'Invalid verification code.';
    }
    if (code === ApiErrorCode.EXPIRED_OTP) {
      return 'Verification code has expired. Please request a new one.';
    }
    if (code === ApiErrorCode.MAX_OTP_ATTEMPTS_EXCEEDED) {
      return 'Too many attempts. Please request a new code.';
    }
    if (code === ApiErrorCode.EMAIL_ALREADY_VERIFIED) {
      return 'This email has already been verified.';
    }
    if (error.status === 400) {
      return 'Invalid or expired verification code.';
    }
    if (error.status === 422) {
      return 'Validation failed. Please check your input.';
    }
    if (error.status === 401) {
      return 'Invalid or expired code. Please try again.';
    }
    if (error.status === 403) {
      return 'Email not verified or account locked.';
    }
    return this.mapGenericError(error);
  }

  private static mapGenericError(error: HttpErrorResponse): string {
    return (
      extractBackendMessage(error) ||
      'Something went wrong. Please try again.'
    );
  }
}