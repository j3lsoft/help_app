import { Injectable, inject, signal } from '@angular/core';
import { LoggerService } from '@core/services/logger.service';
import { toAppError } from '@core/utils/app-error.utils';
import { MeResponseDto } from '@features/auth/models/auth.dto';
import { AuthService } from '@features/auth/services/auth.service';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { UpdateProfileDto } from '../models/update-profile.dto';
import {
  ProfileApiService,
  PublicProfileResponseDto,
} from './profile-api.service';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly profileApi = inject(ProfileApiService);
  private readonly authService = inject(AuthService);
  private readonly logger = inject(LoggerService);

  // In-memory cache for current user's full profile
  private readonly _currentProfile = signal<MeResponseDto | null>(null);
  readonly currentProfile = this._currentProfile.asReadonly();

  // Track the user ID of the cached profile to detect user switch
  private get cachedUserId(): string | null {
    return this._currentProfile()?.id ?? null;
  }

  // Get the current auth user ID
  private get authUserId(): string | null {
    return this.authService.currentUser()?.id ?? null;
  }

  /**
   * Check if cached profile belongs to the current user.
   * Auto-clears cache if user has changed.
   */
  private isCacheValid(): boolean {
    const cachedId = this.cachedUserId;
    const currentId = this.authUserId;

    if (!cachedId || !currentId) {
      return false;
    }

    if (cachedId !== currentId) {
      // Different user logged in - clear stale cache
      this._currentProfile.set(null);
      return false;
    }

    return true;
  }

  /**
   * Get public profile by username.
   */
  getPublicProfile(username: string): Observable<PublicProfileResponseDto> {
    this.logger.debug('Fetching public profile by username', {
      context: 'ProfileService',
      data: { username },
    });

    return this.profileApi.getPublicProfile(username).pipe(
      catchError((error: unknown) => {
        const appError = toAppError(error);
        this.logger.error('Failed to fetch public profile', {
          context: 'ProfileService',
          data: { username, error: appError },
        });
        return throwError(() => appError);
      })
    );
  }

  /**
   * Get current user's full profile with stale-while-revalidate caching.
   * - Returns cached profile immediately if available
   * - Always fetches fresh data in background
   * - Updates cache on successful fetch
   */
  getMyProfile(): Observable<MeResponseDto> {
    this.logger.debug('Fetching my profile', {
      context: 'ProfileService',
    });

    return this.profileApi.getMe().pipe(
      tap((profile) => {
        this._currentProfile.set(profile);
        this.logger.info('My profile loaded', {
          context: 'ProfileService',
          data: { userId: profile.id },
        });
      }),
      catchError((error: unknown) => {
        const appError = toAppError(error);
        this.logger.error('Failed to fetch my profile', {
          context: 'ProfileService',
          data: { error: appError },
        });
        return throwError(() => appError);
      })
    );
  }

  /**
   * Check if profile is cached in memory and belongs to current user.
   */
  hasCachedProfile(): boolean {
    return this.isCacheValid();
  }

  /**
   * Update profile and sync with auth state.
   */
  updateProfile(dto: UpdateProfileDto): Observable<MeResponseDto> {
    this.logger.debug('Starting profile update', {
      context: 'ProfileService',
      data: { dto },
    });

    return this.profileApi.updateMe(dto).pipe(
      tap((updatedUser) => {
        // Update in-memory cache
        this._currentProfile.set(updatedUser);
        // Sync shared fields to auth state
        this.authService.updateAuthUserFromProfile(updatedUser);
        this.logger.info('Profile updated successfully', {
          context: 'ProfileService',
          data: { userId: updatedUser.id },
        });
      }),
      catchError((error: unknown) => {
        const appError = toAppError(error);
        this.logger.error('Profile update failed', {
          context: 'ProfileService',
          data: { error: appError },
        });
        return throwError(() => appError);
      })
    );
  }

  /**
   * Clear the in-memory profile cache.
   * Typically not needed as cache auto-clears on user switch,
   * but available for explicit cleanup.
   */
  clearCache(): void {
    this._currentProfile.set(null);
  }
}
