import { Camera, MediaTypeSelection } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Injectable, inject } from '@angular/core';
import { SelectedPostImage } from '../models/post-creation.model';
import { LoggerService } from '@core/services/logger.service';

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

      const result = await Camera.chooseFromGallery({
        mediaType: MediaTypeSelection.Photo,
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

  private pickWithWebInput(maxCount: number): Promise<SelectedPostImage[]> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      if (maxCount > 1) {
        input.multiple = true;
      }

      input.onchange = () => {
        const files = input.files;
        if (!files || files.length === 0) {
          resolve([]);
          return;
        }
        const selected = this.fromFiles(files, maxCount);
        resolve(selected);
      };

      input.oncancel = () => resolve([]);
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
