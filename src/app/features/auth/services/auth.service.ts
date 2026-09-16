import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthResponseAdapter } from '@features/auth/adapters/auth-response.adapter';
import { AuthState } from '@core/models/auth-state.interface';
import { AppStorageService } from '@core/services/storage/app-storage.service';
import { SecureStorageService } from '@core/services/storage/secure-storage.service';
import { STORAGE_KEYS } from '@core/services/storage/storage-keys';
import { firstValueFrom } from 'rxjs';
import {
  AuthUserDto,
  LoginResponseDto,
  MeResponseDto,
} from '../models/auth.dto';
import { AuthApiService } from './auth-api.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService implements AuthState {
  private readonly storage = inject(AppStorageService);
  private readonly secureStorage = inject(SecureStorageService);
  private readonly authApi = inject(AuthApiService);
  private readonly router = inject(Router);

  private readonly _currentUser = signal<AuthUserDto | null>(null);
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this._currentUser());

  private logoutPromise: Promise<void> | null = null;

  async login(response: LoginResponseDto): Promise<void> {
    const transformedResponse =
      AuthResponseAdapter.transformLoginResponse(response);

    // Access token goes to secure storage (Keychain / Keystore)
    await this.secureStorage.set(
      STORAGE_KEYS.accessToken,
      transformedResponse.accessToken
    );

    if (transformedResponse.user) {
      this._currentUser.set(transformedResponse.user);
      // Non-sensitive user profile data stays in regular storage
      await this.storage.setString(
        STORAGE_KEYS.userData,
        JSON.stringify(transformedResponse.user)
      );
    }
  }

  logout(): Promise<void> {
    if (!this.logoutPromise) {
      this.logoutPromise = this.performLogout().finally(() => {
        this.logoutPromise = null;
      });
    }

    return this.logoutPromise;
  }

  private async performLogout(): Promise<void> {
    try {
      await firstValueFrom(this.authApi.logout());
    } catch {
      // Local logout must always succeed, even if revocation fails.
    }

    await this.secureStorage.remove(STORAGE_KEYS.accessToken);
    await this.storage.remove(STORAGE_KEYS.userData);
    this._currentUser.set(null);
    await this.router.navigateByUrl('/auth/sign-in', { replaceUrl: true });
  }

  async restoreSession(): Promise<void> {
    const token = await this.getAccessToken();
    if (!token) {
      await this.storage.remove(STORAGE_KEYS.userData);
      this._currentUser.set(null);
      return;
    }

    const userData = await this.storage.getString(STORAGE_KEYS.userData);
    if (userData) {
      try {
        this._currentUser.set(JSON.parse(userData));
      } catch {
        await this.logout();
      }
    }
  }

  /**
   * Update auth user fields that are shared with profile.
   * Called when profile is updated.
   */
  async updateAuthUserFromProfile(profile: MeResponseDto): Promise<void> {
    const current = this._currentUser();
    if (!current) return;

    const updated: AuthUserDto = {
      ...current,
      username: profile.username,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
    };
    this._currentUser.set(updated);
    await this.storage.setString(
      STORAGE_KEYS.userData,
      JSON.stringify(updated)
    );
  }

  async getAccessToken(): Promise<string | null> {
    const token = await this.secureStorage.get(STORAGE_KEYS.accessToken);
    if (!token) {
      return null;
    }

    if (!AuthService.isUsableToken(token)) {
      await this.secureStorage.remove(STORAGE_KEYS.accessToken);
      return null;
    }

    return token;
  }

  async refreshSession(): Promise<void> {
    const response = await firstValueFrom(this.authApi.refresh());
    await this.login(response);
  }

  private static isUsableToken(token: string): boolean {
    return token.length > 0 && !/[\u0000-\u001f\u007f]/.test(token);
  }
}
