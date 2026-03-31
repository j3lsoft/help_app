import { Injectable, inject } from '@angular/core';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';
import { LoggerService } from '../logger.service';

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
  private readonly logger = inject(LoggerService);
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
    this.logger.error(`${operation} failed for key '${key}'`, {
      context: 'SecureStorageService',
      data: { key, error: error instanceof Error ? error.message : String(error) },
    });
  }
}
