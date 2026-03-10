import { Injectable, computed, inject, signal } from '@angular/core';
import { AppStorageService } from 'src/app/core/services/storage/app-storage.service';
import { SecureStorageService } from 'src/app/core/services/storage/secure-storage.service';
import { STORAGE_KEYS } from 'src/app/core/services/storage/storage-keys';
import { LoginResponseDto, LoginUserResponseDto } from './auth-api.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly storage = inject(AppStorageService);
  private readonly secureStorage = inject(SecureStorageService);

  private readonly _currentUser = signal<LoginUserResponseDto | null>(null);
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this._currentUser());

  async login(response: LoginResponseDto): Promise<void> {
    // Access token goes to secure storage (Keychain / Keystore)
    await this.secureStorage.set(
      STORAGE_KEYS.accessToken,
      response.accessToken
    );

    if (response.user) {
      this._currentUser.set(response.user);
      // Non-sensitive user profile data stays in regular storage
      await this.storage.setString(
        STORAGE_KEYS.userData,
        JSON.stringify(response.user)
      );
    }
  }

  async logout(): Promise<void> {
    await this.secureStorage.remove(STORAGE_KEYS.accessToken);
    await this.storage.remove(STORAGE_KEYS.userData);
    this._currentUser.set(null);
  }

  async restoreSession(): Promise<void> {
    const token = await this.secureStorage.get(STORAGE_KEYS.accessToken);
    if (!token) {
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
}
