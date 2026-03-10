import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AppStorageService } from '../services/storage/app-storage.service';
import { STORAGE_KEYS } from '../services/storage/storage-keys';

export const onboardingSeenGuard: CanMatchFn = async () => {
  const router = inject(Router);
  const appStorageService = inject(AppStorageService);

  if (await appStorageService.getBoolean(STORAGE_KEYS.hasSeenOnboarding)) {
    return router.createUrlTree(['/auth/sign-in']);
  }

  return true;
};
