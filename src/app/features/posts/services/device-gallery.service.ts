import { Camera, MediaTypeSelection } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Injectable, inject } from '@angular/core';
import { SelectedPostImage } from '../models/post-creation.model';
import { LoggerService } from '@core/services/logger.service';

/**
 * Seam for device photo selection.
 * Native: system gallery picker (Photo Picker / PHPicker) via @capacitor/camera,
 * no library permissions required. Web: <input type="file"> fallback.
 */
@Injectable({
  providedIn: 'root',
})
export class DeviceGalleryService {
  private readonly logger = inject(LoggerService);

  async pickFromGallery(): Promise<SelectedPostImage | null> {
    if (Capacitor.isNativePlatform()) {
      return this.pickWithNativePicker();
    }
    return this.pickWithWebInput();
  }

  private async pickWithNativePicker(): Promise<SelectedPostImage | null> {
    try {
      this.logger.debug('Opening native gallery picker', {
        context: 'DeviceGalleryService',
      });

      const result = await Camera.chooseFromGallery({
        mediaType: MediaTypeSelection.Photo,
      });

      const photo = result.results?.[0];
      if (!photo) {
        return null;
      }

      const src =
        photo.webPath ??
        (photo.uri ? Capacitor.convertFileSrc(photo.uri) : '');

      if (!src) {
        this.logger.error('Gallery picker returned no usable image source', {
          context: 'DeviceGalleryService',
        });
        return null;
      }

      return { src, format: photo.metadata?.format ?? 'jpeg', origin: 'gallery' };
    } catch (error) {
      this.logger.warn('Gallery picker dismissed or failed', {
        context: 'DeviceGalleryService',
        data: { error },
      });
      return null;
    }
  }

  private pickWithWebInput(): Promise<SelectedPostImage | null> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';

      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) {
          resolve(null);
          return;
        }
        resolve({
          src: URL.createObjectURL(file),
          format: this.formatFromFile(file),
          origin: 'web',
        });
      };

      input.oncancel = () => resolve(null);
      input.click();
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
