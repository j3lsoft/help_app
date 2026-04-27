/**
 * Data Transfer Objects for Authentication API
 *
 * These interfaces define the contracts for communication with the auth backend.
 * Keeping them separate from the service implementation improves maintainability
 * and allows for reuse across the application.
 */

export interface RegisterDto {
  displayName: string;
  username: string;
  birthDate: string;
  email: string;
  password: string;
}

export interface RegisterResponseDto {
  message: string;
  userId: string;
}

export interface VerifyEmailDto {
  email: string;
  code: string;
}

export interface ResendVerificationDto {
  email: string;
}

export interface RequestPasswordResetDto {
  email: string;
}

export interface VerifyPasswordResetOtpDto {
  email: string;
  otp: string;
}

export interface VerifyPasswordResetOtpResponseDto {
  changePasswordToken: string;
}

export interface ChangePasswordWithTokenDto {
  changePasswordToken: string;
  newPassword: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordDto {
  email: string;
  code: string;
  newPassword: string;
}

export interface LoginDto {
  emailOrUsername: string;
  password: string;
}

export interface LoginUserResponseDto {
  id: string;
  email: string;
  avatarUrl: unknown | null;
  emailVerified: boolean;
  username: string;
  displayName: string;
}

export interface LoginResponseDto {
  accessToken: string;
  accessTokenExpiresAt: string;
  user?: LoginUserResponseDto;
}

export interface MeResponseDto {
  id: string;
  email: string;
  emailVerified: boolean;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  birthDate: string | null;
  bio: string | null;
  website: string | null;
}

/**
 * Minimal user data for auth state (stored in storage).
 * Excludes bio, website, birthDate - those are fetched on-demand by ProfileService.
 */
export interface AuthUserDto {
  id: string;
  email: string;
  emailVerified: boolean;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
}
