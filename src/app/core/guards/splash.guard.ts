import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { Device } from '@capacitor/device';
import { AppStorageService } from '../services/storage/app-storage.service';
import { STORAGE_KEYS } from '../services/storage/storage-keys';

/**
 * Guard that skips the Ionic splash page on Android 11 and below,
 * navigating directly to the next target (onboarding or sign-in).
 */
export const splashGuard: CanMatchFn = async () => {
  // inject() must be called synchronously before any await
  const appStorageService = inject(AppStorageService);
  const router = inject(Router);

  const device = await Device.getInfo();

  // If not Android or Android version > 11, proceed to the splash page normally
  const isLegacyAndroid =
    device.platform === 'android' && parseInt(device.osVersion, 10) <= 11;

  if (!isLegacyAndroid) {
    return true;
  }

  // Logic to determine the next destination
  const hasSeenOnboarding = await appStorageService.getBoolean(
    STORAGE_KEYS.hasSeenOnboarding
  );

  const targetUrl = hasSeenOnboarding ? '/auth/sign-in' : '/onboarding';

  return router.createUrlTree([targetUrl]);
};
