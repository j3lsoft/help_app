import { ErrorMapConfig } from '../../../core/errors/error-map.interface';

export type AuthErrorContext =
  | 'login'
  | 'register'
  | 'password-reset'
  | 'password-change'
  | 'verification';

export const AUTH_ERROR_MAP: Record<AuthErrorContext, ErrorMapConfig> = {
  login: {
    byCode: {
      INVALID_CREDENTIALS: 'Invalid email/username or password.',
      ACCOUNT_NOT_VERIFIED:
        'Your account has not been verified. Please check your email.',
      ACCOUNT_LOCKED: 'Your account has been locked. Please contact support.',
    },
    byStatus: {
      401: 'Invalid email/username or password.',
      403: 'Your account has not been verified. Please check your email.',
    },
    fallback: 'Login failed. Please try again.',
  },
  register: {
    byCode: {
      USERNAME_ALREADY_EXISTS: 'An account with this username already exists.',
      USER_EMAIL_ALREADY_EXISTS: 'An account with this email already exists.',
    },
    byStatus: {
      409: 'Username or email already exists.',
      400: 'Invalid data provided. Please check your information.',
    },
    fallback: 'Registration failed. Please try again.',
  },
  'password-reset': {
    byCode: {
      INVALID_OTP: 'Invalid verification code. Please try again.',
      EXPIRED_OTP: 'Verification code has expired. Please request a new one.',
      MAX_OTP_ATTEMPTS_EXCEEDED:
        'Too many failed attempts. Please request a new code.',
    },
    byStatus: {
      422: 'Invalid email address. Please check and try again.',
      400: 'Invalid request. Please try again.',
    },
    fallback: 'Password reset failed. Please try again.',
  },
  'password-change': {
    byCode: {
      INVALID_CURRENT_PASSWORD: 'Current password is incorrect.',
      INVALID_NEW_PASSWORD: 'New password does not meet requirements.',
      INVALID_CHANGE_PASSWORD_TOKEN:
        'Invalid or expired token. Please request a new password reset.',
      EXPIRED_CHANGE_PASSWORD_TOKEN:
        'Token has expired. Please request a new password reset.',
    },
    byStatus: {
      400: 'Invalid or expired token. Please request a new password reset.',
      422: 'Validation failed. Please check your information.',
    },
    fallback: 'Password change failed. Please try again.',
  },
  verification: {
    byCode: {
      INVALID_OTP: 'Invalid verification code. Please try again.',
      EXPIRED_OTP: 'Verification code has expired. Please request a new one.',
      MAX_OTP_ATTEMPTS_EXCEEDED:
        'Too many failed attempts. Please request a new code.',
      EMAIL_ALREADY_VERIFIED: 'This email has already been verified.',
    },
    byStatus: {
      400: 'Invalid or expired verification code.',
      422: 'Validation failed. Please check your information.',
      401: 'Invalid or expired verification code.',
      403: 'Email not verified or account locked.',
    },
    fallback: 'Verification failed. Please try again.',
  },
};
