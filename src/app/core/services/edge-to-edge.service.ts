import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';
import { StatusBar, Style } from '@capacitor/status-bar';
import { EdgeToEdge } from '@capawesome/capacitor-android-edge-to-edge-support';

@Injectable({
  providedIn: 'root',
})
export class EdgeToEdgeService {
  private readonly isAndroid = Capacitor.getPlatform() === 'android';
  private initialized = false;

  async initialize(): Promise<void> {
    if (!this.isAndroid || this.initialized) {
      return;
    }

    await this.applyStatusBarOverlay();
    await this.applyStatusBarStyle();
    await this.applyEdgeToEdge(true);
    await this.applyNavigationBarColor();
    this.initialized = true;
  }

  async updateStyleFromTheme(): Promise<void> {
    if (!this.isAndroid) {
      return;
    }

    await this.applyStatusBarStyle();
  }

  private async applyStatusBarOverlay(): Promise<void> {
    await this.runSafely('StatusBar.setOverlaysWebView()', async () => {
      await StatusBar.setOverlaysWebView({ overlay: true });
    });
  }

  private async applyStatusBarStyle(): Promise<void> {
    await this.runSafely('StatusBar.setStyle()', async () => {
      await StatusBar.setStyle({ style: this.getStatusBarStyle() });
    });
  }

  private async applyEdgeToEdge(enabled: boolean): Promise<void> {
    await this.runSafely(
      enabled ? 'EdgeToEdge.enable()' : 'EdgeToEdge.disable()',
      async () => {
        if (enabled) {
          await EdgeToEdge.enable();
          return;
        }
        await EdgeToEdge.disable();
      }
    );
  }

  private getStatusBarStyle(): Style {
    // const supportsMatchMedia =
    //   typeof window !== 'undefined' && typeof window.matchMedia === 'function';
    // const prefersDarkTheme = supportsMatchMedia
    //   ? window.matchMedia('(prefers-color-scheme: dark)').matches
    //   : false;
    // return prefersDarkTheme ? Style.Light : Style.Dark;
    return Style.Dark;
  }

  private async applyNavigationBarColor(): Promise<void> {
    const color = await this.getNavigationBarColorForAndroidVersion();
    await this.runSafely('EdgeToEdge.setNavigationBarColor()', async () => {
      await EdgeToEdge.setNavigationBarColor({ color });
    });
  }

  private async getNavigationBarColorForAndroidVersion(): Promise<string> {
    const deviceInfo = await Device.getInfo();
    const androidVersion = deviceInfo.androidSDKVersion ?? 0;

    // Android 10+ (API 29+) supports light navigation bar buttons
    // Android 9 and below only support dark buttons
    if (androidVersion >= 29) {
      return '#000000'; // Dark bar with light buttons (Android 10+)
    }
    return '#F5F5F5'; // Light bar with dark system buttons (Android 9-)
  }

  private async runSafely(
    operation: string,
    action: () => Promise<void>
  ): Promise<void> {
    if (!this.isAndroid) {
      return;
    }

    try {
      await action();
    } catch (error) {
      console.warn(`${operation} failed:`, error);
    }
  }
}
