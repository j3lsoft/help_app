import { Injectable } from '@angular/core';
import {
  CanMatch,
  Route,
  Router,
  UrlSegment,
  UrlTree,
} from '@angular/router';
import { AppStorageService } from '../services/app-storage.service';
import { STORAGE_KEYS } from '../services/storage-keys';

@Injectable({
  providedIn: 'root',
})
export class OnboardingSeenGuard implements CanMatch {
  constructor(
    private router: Router,
    private appStorageService: AppStorageService,
  ) {}

  canMatch(route: Route, segments: UrlSegment[]): boolean | UrlTree {
    if (this.appStorageService.getBoolean(STORAGE_KEYS.hasSeenOnboarding)) {
      return this.router.createUrlTree(['/auth/sign-in']);
    }

    return true;
  }
}
