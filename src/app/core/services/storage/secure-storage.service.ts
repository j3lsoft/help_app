import { Injectable } from '@angular/core';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';
import { environment } from 'src/environments/environment';

/**
 * SecureStorageService wraps capacitor-secure-storage-plugin.
 *
 * It uses Keychain on iOS and Keystore on Android.
 * In the browser it uses a fallback.
 *
 * Use this service for sensitive values such as access tokens.
 * For non-sensitive data use AppStorageService instead.
 */
@Injectable({
  providedIn: 'root',
})
export class SecureStorageService {
  async get(key: string): Promise<string | null> {
    try {
      const { value } = await SecureStoragePlugin.get({ key });
      return value;
    } catch (error) {
      this.logError('get', key, error);
      return null;
    }
  }

  async set(key: string, value: string): Promise<void> {
    try {
      await SecureStoragePlugin.set({ key, value });
    } catch (error) {
      this.logError('set', key, error);
    }
  }

  async remove(key: string): Promise<void> {
    try {
      await SecureStoragePlugin.remove({ key });
    } catch (error) {
      this.logError('remove', key, error);
    }
  }

  private logError(operation: string, key: string, error: unknown): void {
    if (!environment.production) {
      // eslint-disable-next-line no-console
      console.error(
        `[SecureStorageService] ${operation} failed for key '${key}':`,
        error
      );
    }
  }
}
