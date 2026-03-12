import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface RegisterDto {
  name: string;
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
  name: string;
  email: string;
  image: unknown | null;
  emailVerified: boolean;
}

export interface LoginResponseDto {
  accessToken: string;
  accessTokenExpiresAt: string;
  user?: LoginUserResponseDto;
}

@Injectable({
  providedIn: 'root',
})
export class AuthApiService {
  private readonly baseUrl = environment.apiBaseUrl;
  private readonly http = inject(HttpClient);

  register(dto: RegisterDto) {
    return this.http
      .post<RegisterResponseDto>(`${this.baseUrl}/api/v1/auth/register`, dto)
      .pipe(catchError((e) => this.normalizeError(e)));
  }

  verifyEmail(dto: VerifyEmailDto) {
    return this.http
      .post<LoginResponseDto>(`${this.baseUrl}/api/v1/auth/verify-email`, dto)
      .pipe(catchError((e) => this.normalizeError(e)));
  }

  resendVerification(dto: ResendVerificationDto) {
    return this.http
      .post<void>(`${this.baseUrl}/api/v1/auth/resend-verification`, dto)
      .pipe(catchError((e) => this.normalizeError(e)));
  }

  requestPasswordReset(dto: RequestPasswordResetDto) {
    return this.http
      .post<void>(`${this.baseUrl}/api/v1/auth/request-password-reset`, dto)
      .pipe(catchError((e) => this.normalizeError(e)));
  }

  verifyPasswordResetOtp(dto: VerifyPasswordResetOtpDto) {
    return this.http
      .post<VerifyPasswordResetOtpResponseDto>(
        `${this.baseUrl}/api/v1/auth/verify-password-reset-otp`,
        dto
      )
      .pipe(catchError((e) => this.normalizeError(e)));
  }

  changePasswordWithToken(dto: ChangePasswordWithTokenDto) {
    return this.http
      .post<void>(`${this.baseUrl}/api/v1/auth/change-password-with-token`, dto)
      .pipe(catchError((e) => this.normalizeError(e)));
  }

  resetPassword(dto: ResetPasswordDto) {
    return this.http
      .post<void>(`${this.baseUrl}/api/v1/auth/reset-password`, dto)
      .pipe(catchError((e) => this.normalizeError(e)));
  }

  login(dto: LoginDto) {
    return this.http
      .post<LoginResponseDto>(`${this.baseUrl}/api/v1/auth/login`, dto)
      .pipe(catchError((e) => this.normalizeError(e)));
  }

  refresh() {
    return this.http
      .post<LoginResponseDto>(
        `${this.baseUrl}/api/v1/auth/refresh`,
        {},
        { withCredentials: true }
      )
      .pipe(catchError((e) => this.normalizeError(e)));
  }

  getMe() {
    return this.http
      .get<LoginUserResponseDto>(`${this.baseUrl}/api/v1/auth/me`)
      .pipe(catchError((e) => this.normalizeError(e)));
  }

  private normalizeError(error: unknown) {
    if (error instanceof HttpErrorResponse) {
      return throwError(() => error);
    }
    return throwError(() => new Error('Unexpected error'));
  }
}
