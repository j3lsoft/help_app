import {
  Camera,
  ChooseFromGalleryOptions,
  MediaResults,
  MediaTypeSelection,
} from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Injectable, inject } from '@angular/core';
import { SelectedPostImage } from '../models/post-creation.model';
import { LoggerService } from '@core/services/logger.service';

/**
 * How long to wait after the window regains focus before treating a closed
 * picker as a cancellation. Gives a pending `change` event time to win.
 */
const WEB_PICKER_CLOSE_DELAY_MS = 400;

/**
 * Seam for device photo selection.
 * Native: system gallery picker (Photo Picker / PHPicker) via @capacitor/camera,
 * no library permissions required. Web: <input type="file" multiple> fallback.
 */
@Injectable({
  providedIn: 'root',
})
export class DeviceGalleryService {
  private readonly logger = inject(LoggerService);

  async pickFromGallery(maxCount: number = 5): Promise<SelectedPostImage[]> {
    if (maxCount <= 0) return [];
    if (Capacitor.isNativePlatform()) {
      return this.pickWithNativePicker(maxCount);
    }
    return this.pickWithWebInput(maxCount);
  }

  /** Web drag & drop entry: turns a dropped File into a selectable image. */
  fromFile(file: File): SelectedPostImage {
    return {
      src: URL.createObjectURL(file),
      format: this.formatFromFile(file),
      origin: 'web',
    };
  }

  /** Turn multiple files (from file input or drop event) into SelectedPostImage array. */
  fromFiles(files: FileList | File[], maxCount: number = 5): SelectedPostImage[] {
    const fileArray = Array.from(files).slice(0, maxCount);
    return fileArray.map((file) => this.fromFile(file));
  }

  private async pickWithNativePicker(maxCount: number): Promise<SelectedPostImage[]> {
    try {
      this.logger.debug('Opening native gallery picker', {
        context: 'DeviceGalleryService',
        data: { maxCount },
      });

      const result = await this.openNativeGallery({
        mediaType: MediaTypeSelection.Photo,
        allowMultipleSelection: maxCount > 1,
        limit: maxCount,
      });

      const photos = result.results ?? [];
      if (photos.length === 0) {
        return [];
      }

      const images: SelectedPostImage[] = [];
      for (const photo of photos.slice(0, maxCount)) {
        const src =
          photo.webPath ??
          (photo.uri ? Capacitor.convertFileSrc(photo.uri) : '');

        if (src) {
          images.push({
            src,
            format: photo.metadata?.format ?? 'jpeg',
            origin: 'gallery',
          });
        }
      }

      return images;
    } catch (error) {
      this.logger.warn('Gallery picker dismissed or failed', {
        context: 'DeviceGalleryService',
        data: { error },
      });
      return [];
    }
  }

  /** Thin seam over the native picker so the call can be substituted in tests. */
  protected openNativeGallery(options: ChooseFromGalleryOptions): Promise<MediaResults> {
    return Camera.chooseFromGallery(options);
  }

  private pickWithWebInput(maxCount: number): Promise<SelectedPostImage[]> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      if (maxCount > 1) {
        input.multiple = true;
      }
      // Keep the input off-screen but IN the DOM. A detached file input can lose
      // its `change`/`input` event on Blink (the element may be collected while
      // the native dialog is open), which silently drops the selection.
      input.style.position = 'fixed';
      input.style.left = '-9999px';
      input.style.width = '1px';
      input.style.height = '1px';
      input.style.opacity = '0';
      input.tabIndex = -1;
      input.setAttribute('aria-hidden', 'true');

      let settled = false;
      let focusTimer: number | null = null;

      const cleanup = () => {
        input.removeEventListener('change', onChange);
        input.removeEventListener('cancel', onCancel);
        if (typeof window !== 'undefined') {
          window.removeEventListener('focus', onWindowFocus);
        }
        if (focusTimer !== null) {
          window.clearTimeout(focusTimer);
          focusTimer = null;
        }
        input.remove();
      };

      const finish = (images: SelectedPostImage[]) => {
        if (settled) {
          return;
        }
        settled = true;
        cleanup();
        resolve(images);
      };

      /** Reads whatever the control holds; empty means the user cancelled. */
      const readSelection = (): SelectedPostImage[] => {
        const files = input.files;
        return files && files.length > 0 ? this.fromFiles(files, maxCount) : [];
      };

      const onChange = () => finish(readSelection());

      const onCancel = () => finish([]);

      // Older WebViews (notably iOS Safari) never fire `cancel`. Regaining
      // window focus after the picker closes is the fallback: wait a beat for a
      // `change` to win, then read the control instead of assuming a cancel —
      // some browsers set `files` without delivering `change` reliably.
      const onWindowFocus = () => {
        if (focusTimer !== null) {
          window.clearTimeout(focusTimer);
        }
        focusTimer = window.setTimeout(() => finish(readSelection()), WEB_PICKER_CLOSE_DELAY_MS);
      };

      input.addEventListener('change', onChange);
      input.addEventListener('cancel', onCancel);
      if (typeof window !== 'undefined') {
        window.addEventListener('focus', onWindowFocus);
      }

      document.body.appendChild(input);
      try {
        input.click();
      } catch (error) {
        this.logger.warn('Could not open the file picker', {
          context: 'DeviceGalleryService',
          data: { message: String(error) },
        });
        finish([]);
      }
    });
  }

  private formatFromFile(file: File): string {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'png' || ext === 'gif' || ext === 'webp') {
      return ext;
    }
    return 'jpeg';
  }
}
