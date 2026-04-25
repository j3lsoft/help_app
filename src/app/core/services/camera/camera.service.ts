import { Injectable, inject } from '@angular/core';
import {
  Camera,
  CameraResultType,
  CameraSource,
  Photo,
} from '@capacitor/camera';
import { LoggerService } from '../logger.service';

export type CameraPermissionState =
  | 'prompt'
  | 'granted'
  | 'denied'
  | 'limited'
  | 'prompt-with-rationale';

export interface CameraPermissionStatus {
  camera: CameraPermissionState;
  photos: CameraPermissionState;
}

export interface CameraOptions {
  quality?: number;
  allowEditing?: boolean;
  correctOrientation?: boolean;
}

export interface CameraErrorInterface {
  message: string;
  code?: string;
  isPermissionDenied?: boolean;
}

export interface CameraResult {
  dataUrl: string;
  format: string;
  path?: string;
}

export class CameraError extends Error {
  constructor(
    message: string,
    public code?: string,
    public isPermissionDenied?: boolean
  ) {
    super(message);
    this.name = 'CameraError';
  }
}

@Injectable({
  providedIn: 'root',
})
export class CameraService {
  private readonly logger = inject(LoggerService);

  /**
   * Take a photo using the device camera
   */
  async takePhoto(options: CameraOptions = {}): Promise<CameraResult> {
    return this.capturePhoto(CameraSource.Camera, options);
  }

  /**
   * Select a photo from the device gallery
   */
  async selectFromGallery(options: CameraOptions = {}): Promise<CameraResult> {
    return this.capturePhoto(CameraSource.Photos, options);
  }

  /**
   * Capture photo with specified source
   */
  private async capturePhoto(
    source: CameraSource,
    options: CameraOptions
  ): Promise<CameraResult> {
    const operation =
      source === CameraSource.Camera ? 'takePhoto' : 'selectFromGallery';
    const sourceLabel = source === CameraSource.Camera ? 'camera' : 'gallery';

    try {
      this.logger.debug(
        source === CameraSource.Camera
          ? 'Taking photo with camera'
          : 'Selecting photo from gallery',
        {
          context: 'CameraService',
          data: { options },
        }
      );

      const photo: Photo = await Camera.getPhoto({
        quality: options.quality ?? 80,
        allowEditing: options.allowEditing ?? false,
        correctOrientation: options.correctOrientation ?? true,
        resultType: CameraResultType.DataUrl,
        source,
        saveToGallery: source === CameraSource.Camera ? false : undefined,
      });

      return this.processPhotoResult(photo);
    } catch (error) {
      throw this.handleCameraError(error);
    }
  }

  /**
   * Check camera permissions
   */
  async checkPermissions(): Promise<CameraPermissionStatus> {
    const permissions = await Camera.checkPermissions();
    return {
      camera: permissions.camera,
      photos: permissions.photos,
    };
  }

  /**
   * Request camera permissions
   */
  async requestPermissions(): Promise<CameraPermissionStatus> {
    const permissions = await Camera.requestPermissions();
    return {
      camera: permissions.camera,
      photos: permissions.photos,
    };
  }

  /**
   * Process the photo result and return standardized format
   */
  private processPhotoResult(photo: Photo): CameraResult {
    if (!photo.dataUrl) {
      throw new CameraError('No image data received from camera');
    }

    return {
      dataUrl: photo.dataUrl,
      format: photo.format || 'jpeg',
      path: photo.path,
    };
  }

  /**
   * Handle and normalize camera errors
   */
  private handleCameraError(error: unknown): CameraError {
    const operation = 'camera operation';
    this.logger.error(`Camera error in ${operation}`, {
      context: 'CameraService',
      data: { error },
    });

    const errorMessage =
      (error instanceof Error ? error.message : String(error)) ||
      'Unknown camera error';
    const isPermissionDenied =
      errorMessage.toLowerCase().includes('permission') ||
      errorMessage.toLowerCase().includes('denied') ||
      errorMessage.toLowerCase().includes('user denied');

    return new CameraError(errorMessage, undefined, isPermissionDenied);
  }
}
