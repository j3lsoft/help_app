import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AppStorageService {
  getString(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  setString(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      // ignore
    }
  }

  getBoolean(key: string): boolean {
    return this.getString(key) === 'true';
  }

  setBoolean(key: string, value: boolean): void {
    this.setString(key, String(value));
  }
}
