import { InjectionToken } from '@angular/core';
import { environment } from '@env/environment';
import { UploadConfig } from './models/upload-config.model';

export const UPLOAD_CONFIG = new InjectionToken<UploadConfig>('UPLOAD_CONFIG', {
  providedIn: 'root',
  factory: () => environment.upload as UploadConfig,
});
