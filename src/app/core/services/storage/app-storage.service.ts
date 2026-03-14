import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { environment } from 'src/environments/environment';

/**
 * Service for non-sensitive data storage using Capacitor Preferences.
 * Uses local storage on web, native preferences on mobile.
 */
@Injectable({
  providedIn: 'root',
})
export class AppStorageService {
  async getString(key: string): Promise<string | null> {
    try {
      const { value } = await Preferences.get({ key });
      return value;
    } catch (error) {
      this.logError('getString', key, error);
      return null;
    }
  }

  async setString(key: string, value: string): Promise<void> {
    try {
      await Preferences.set({ key, value });
    } catch (error) {
      this.logError('setString', key, error);
    }
  }

  async remove(key: string): Promise<void> {
    try {
      await Preferences.remove({ key });
    } catch (error) {
      this.logError('remove', key, error);
    }
  }

  async getBoolean(key: string): Promise<boolean> {
    const value = await this.getString(key);
    return value === 'true';
  }

  async setBoolean(key: string, value: boolean): Promise<void> {
    await this.setString(key, String(value));
  }

  private logError(operation: string, key: string, error: unknown): void {
    if (!environment.production) {
      // eslint-disable-next-line no-console
      console.error(
        `[AppStorageService] ${operation} failed for key '${key}':`,
        error
      );
    }
  }
}
