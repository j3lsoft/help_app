import { Injectable } from '@angular/core';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

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
    } catch {
      return null;
    }
  }

  async set(key: string, value: string): Promise<void> {
    try {
      await SecureStoragePlugin.set({ key, value });
    } catch {
      // ignore
    }
  }

  async remove(key: string): Promise<void> {
    try {
      await SecureStoragePlugin.remove({ key });
    } catch {
      // ignore
    }
  }
}
