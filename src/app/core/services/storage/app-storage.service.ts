import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root',
})
export class AppStorageService {
  async getString(key: string): Promise<string | null> {
    try {
      const { value } = await Preferences.get({ key });
      return value;
    } catch {
      return null;
    }
  }

  async setString(key: string, value: string): Promise<void> {
    try {
      await Preferences.set({ key, value });
    } catch {
      // ignore
    }
  }

  async getBoolean(key: string): Promise<boolean> {
    const value = await this.getString(key);
    return value === 'true';
  }

  async setBoolean(key: string, value: boolean): Promise<void> {
    await this.setString(key, String(value));
  }
}
