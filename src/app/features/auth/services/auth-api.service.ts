import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@env/environment';
import {
  ChangePasswordDto,
  ChangePasswordWithTokenDto,
  LoginDto,
  LoginResponseDto,
  MeResponseDto,
  RegisterDto,
  RegisterResponseDto,
  RequestPasswordResetDto,
  ResendVerificationDto,
  ResetPasswordDto,
  VerifyEmailDto,
  VerifyPasswordResetOtpDto,
  VerifyPasswordResetOtpResponseDto,
} from '../models/auth.dto';

@Injectable({
  providedIn: 'root',
})
export class AuthApiService {
  private readonly baseUrl = environment.apiBaseUrl;
  private readonly http = inject(HttpClient);

  register(dto: RegisterDto) {
    return this.http.post<RegisterResponseDto>(
      `${this.baseUrl}/api/v1/auth/register`,
      dto
    );
  }

  verifyEmail(dto: VerifyEmailDto) {
    return this.http.post<LoginResponseDto>(
      `${this.baseUrl}/api/v1/auth/verify-email`,
      dto
    );
  }

  resendVerification(dto: ResendVerificationDto) {
    return this.http.post<void>(
      `${this.baseUrl}/api/v1/auth/resend-verification`,
      dto
    );
  }

  requestPasswordReset(dto: RequestPasswordResetDto) {
    return this.http.post<void>(
      `${this.baseUrl}/api/v1/auth/request-password-reset`,
      dto
    );
  }

  verifyPasswordResetOtp(dto: VerifyPasswordResetOtpDto) {
    return this.http.post<VerifyPasswordResetOtpResponseDto>(
      `${this.baseUrl}/api/v1/auth/verify-password-reset-otp`,
      dto
    );
  }

  changePasswordWithToken(dto: ChangePasswordWithTokenDto) {
    return this.http.post<void>(
      `${this.baseUrl}/api/v1/auth/change-password-with-token`,
      dto
    );
  }

  changePassword(dto: ChangePasswordDto) {
    return this.http.patch<void>(
      `${this.baseUrl}/api/v1/auth/change-password`,
      dto
    );
  }

  resetPassword(dto: ResetPasswordDto) {
    return this.http.post<void>(
      `${this.baseUrl}/api/v1/auth/reset-password`,
      dto
    );
  }

  login(dto: LoginDto) {
    return this.http.post<LoginResponseDto>(
      `${this.baseUrl}/api/v1/auth/login`,
      dto
    );
  }

  refresh() {
    return this.http.post<LoginResponseDto>(
      `${this.baseUrl}/api/v1/auth/refresh`,
      {},
      { withCredentials: true }
    );
  }

  getMe() {
    return this.http.get<MeResponseDto>(`${this.baseUrl}/api/v1/users/me`);
  }
}
