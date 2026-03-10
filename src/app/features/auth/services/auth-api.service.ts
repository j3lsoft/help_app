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

  login(dto: LoginDto) {
    return this.http
      .post<LoginResponseDto>(`${this.baseUrl}/api/v1/auth/login`, dto)
      .pipe(catchError((e) => this.normalizeError(e)));
  }

  private normalizeError(error: unknown) {
    if (error instanceof HttpErrorResponse) {
      return throwError(() => error);
    }
    return throwError(() => new Error('Unexpected error'));
  }
}
