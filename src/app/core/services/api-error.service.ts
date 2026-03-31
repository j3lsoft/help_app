import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

export enum ApiErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  INVALID_REFRESH_TOKEN = 'INVALID_REFRESH_TOKEN',
  ACCOUNT_NOT_VERIFIED = 'ACCOUNT_NOT_VERIFIED',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  INVALID_OTP = 'INVALID_OTP',
  EXPIRED_OTP = 'EXPIRED_OTP',
  MAX_OTP_ATTEMPTS_EXCEEDED = 'MAX_OTP_ATTEMPTS_EXCEEDED',
  INVALID_CURRENT_PASSWORD = 'INVALID_CURRENT_PASSWORD',
  INVALID_NEW_PASSWORD = 'INVALID_NEW_PASSWORD',
  INVALID_CHANGE_PASSWORD_TOKEN = 'INVALID_CHANGE_PASSWORD_TOKEN',
  EXPIRED_CHANGE_PASSWORD_TOKEN = 'EXPIRED_CHANGE_PASSWORD_TOKEN',
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  EMAIL_ALREADY_VERIFIED = 'EMAIL_ALREADY_VERIFIED',
}

@Injectable({
  providedIn: 'root',
})
export class ApiErrorService {
  private readonly errorMessages: Record<string, string> = {
    [ApiErrorCode.INVALID_CREDENTIALS]: 'Invalid email or password.',
    [ApiErrorCode.INVALID_REFRESH_TOKEN]:
      'Your session has expired. Please log in again.',
    [ApiErrorCode.ACCOUNT_NOT_VERIFIED]:
      'Please verify your email before logging in.',
    [ApiErrorCode.ACCOUNT_LOCKED]:
      'Your account has been locked. Please contact support.',
    [ApiErrorCode.INVALID_OTP]: 'Invalid verification code.',
    [ApiErrorCode.EXPIRED_OTP]:
      'Verification code has expired. Please request a new one.',
    [ApiErrorCode.MAX_OTP_ATTEMPTS_EXCEEDED]:
      'Too many attempts. Please request a new code.',
    [ApiErrorCode.INVALID_CURRENT_PASSWORD]: 'Current password is incorrect.',
    [ApiErrorCode.INVALID_NEW_PASSWORD]:
      'New password does not meet requirements.',
    [ApiErrorCode.INVALID_CHANGE_PASSWORD_TOKEN]:
      'Invalid password reset token.',
    [ApiErrorCode.EXPIRED_CHANGE_PASSWORD_TOKEN]:
      'Password reset token has expired.',
    [ApiErrorCode.USER_ALREADY_EXISTS]:
      'An account with this email already exists.',
    [ApiErrorCode.USER_NOT_FOUND]: 'User not found.',
    [ApiErrorCode.EMAIL_ALREADY_VERIFIED]:
      'This email has already been verified.',
  };

  getMessage(code: string): string {
    return this.errorMessages[code] ?? '';
  }

  extractCode(error: HttpErrorResponse): string | null {
    const code = error.error?.code;
    return typeof code === 'string' ? code : null;
  }

  isKnownError(code: string): boolean {
    return code in this.errorMessages;
  }
}

