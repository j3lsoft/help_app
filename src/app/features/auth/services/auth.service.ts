import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthResponseAdapter } from '@features/auth/adapters/auth-response.adapter';
import { AuthState } from '@core/models/auth-state.interface';
import { AppStorageService } from '@core/services/storage/app-storage.service';
import { SecureStorageService } from '@core/services/storage/secure-storage.service';
import { STORAGE_KEYS } from '@core/services/storage/storage-keys';
import { LoggerService } from '@core/services/logger.service';
import { firstValueFrom, timeout } from 'rxjs';
import {
  AuthUserDto,
  LoginResponseDto,
  MeResponseDto,
} from '../models/auth.dto';
import { AuthApiService } from './auth-api.service';

/**
 * Upper bound for the server-side session revocation attempt. Local logout
 * must always complete, so a hung request may not block it forever.
 */
const LOGOUT_REVOKE_TIMEOUT_MS = 3000;

@Injectable({
  providedIn: 'root',
})
export class AuthService implements AuthState {
  private readonly storage = inject(AppStorageService);
  private readonly secureStorage = inject(SecureStorageService);
  private readonly authApi = inject(AuthApiService);
  private readonly router = inject(Router);
  private readonly logger = inject(LoggerService);

  private readonly _currentUser = signal<AuthUserDto | null>(null);
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this._currentUser());

  private logoutPromise: Promise<void> | null = null;

  async login(response: LoginResponseDto): Promise<void> {
    const user = await this.persistSession(response);

    if (user) {
      return;
    }

    // The login contract allows a response without `user`. Complete the session
    // from `GET /me`; otherwise `isAuthenticated()` stays false and authGuard
    // would bounce a user that actually holds a valid token.
    try {
      const me = await firstValueFrom(this.authApi.getMe());
      await this.persistUser(AuthResponseAdapter.transformMeResponseToAuth(me));
    } catch (error) {
      await this.rollbackSession();
      throw error;
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
      await firstValueFrom(
        this.authApi.logout().pipe(timeout(LOGOUT_REVOKE_TIMEOUT_MS))
      );
    } catch (error) {
      // Local logout must always succeed, even if revocation fails or hangs.
      this.logger.warn('Session revocation failed; local logout proceeds', {
        context: 'AuthService',
        data: { reason: error instanceof Error ? error.message : String(error) },
      });
    }

    await this.secureStorage.remove(STORAGE_KEYS.accessToken);
    await this.secureStorage.remove(STORAGE_KEYS.pendingChangePasswordToken);
    // Purge any legacy plaintext copy written by earlier versions so it cannot
    // outlive the session.
    await this.storage.remove(STORAGE_KEYS.pendingChangePasswordToken);
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
    // Deliberately no GET /me here: this runs inside the TokenRefreshService
    // factory, and a 401 on that /me would join the same in-flight refresh and
    // deadlock. Only update the user when the response carries one.
    await this.persistSession(response);
  }

  /**
   * Persists the access token and, when present, the user. Returns the user
   * that travelled in the response (`null` when it was omitted).
   */
  private async persistSession(
    response: LoginResponseDto
  ): Promise<AuthUserDto | null> {
    const transformedResponse =
      AuthResponseAdapter.transformLoginResponse(response);

    // Access token goes to secure storage (Keychain / Keystore)
    await this.secureStorage.set(
      STORAGE_KEYS.accessToken,
      transformedResponse.accessToken
    );

    if (transformedResponse.user) {
      await this.persistUser(transformedResponse.user);
    }

    return transformedResponse.user;
  }

  private async persistUser(user: AuthUserDto): Promise<void> {
    this._currentUser.set(user);
    // Non-sensitive user profile data stays in regular storage
    await this.storage.setString(STORAGE_KEYS.userData, JSON.stringify(user));
  }

  /** Undoes a session that could not be completed (e.g. `GET /me` failed). */
  private async rollbackSession(): Promise<void> {
    await this.secureStorage.remove(STORAGE_KEYS.accessToken);
    await this.storage.remove(STORAGE_KEYS.userData);
    this._currentUser.set(null);
  }

  private static isUsableToken(token: string): boolean {
    return token.length > 0 && !/[\u0000-\u001f\u007f]/.test(token);
  }
}
