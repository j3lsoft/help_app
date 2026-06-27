import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AppStorageService } from '../services/storage/app-storage.service';
import { STORAGE_KEYS } from '../services/storage/storage-keys';
import { LoggerService } from '../services/logger.service';

export const onboardingSeenGuard: CanMatchFn = async () => {
  const router = inject(Router);
  const appStorageService = inject(AppStorageService);
  const logger = inject(LoggerService);

  try {
    if (
      await appStorageService.getBoolean(STORAGE_KEYS.hasSeenOnboarding)
    ) {
      return router.createUrlTree(['/auth/sign-in']);
    }
  } catch (error) {
    logger.error('Failed to read onboarding state', {
      context: 'OnboardingSeenGuard',
      data: { error: error instanceof Error ? error.message : String(error) },
    });
  }

  return true;
};
