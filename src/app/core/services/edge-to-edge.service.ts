import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
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
