import { Injectable, inject } from '@angular/core';
import { LoggerService } from '@core/services/logger.service';
import { toAppError } from '@core/utils/app-error.utils';
import { MeResponseDto } from '@features/auth/models/auth.dto';
import { AuthService } from '@features/auth/services/auth.service';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { UpdateProfileDto } from '../models/update-profile.dto';
import {
  ProfileApiService,
  UserProfileResponseDto,
} from './profile-api.service';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly profileApi = inject(ProfileApiService);
  private readonly authService = inject(AuthService);
  private readonly logger = inject(LoggerService);

  getUserProfile(userId: string): Observable<UserProfileResponseDto> {
    this.logger.debug('Fetching user profile', {
      context: 'ProfileService',
      data: { userId },
    });

    return this.profileApi.getUserProfile(userId).pipe(
      catchError((error: unknown) => {
        const appError = toAppError(error);
        this.logger.error('Failed to fetch user profile', {
          context: 'ProfileService',
          data: { userId, error: appError },
        });
        return throwError(() => appError);
      })
    );
  }

  updateProfile(dto: UpdateProfileDto): Observable<MeResponseDto> {
    this.logger.debug('Starting profile update', {
      context: 'ProfileService',
      data: { dto },
    });

    return this.profileApi.updateMe(dto).pipe(
      tap((updatedUser) => {
        this.authService.updateCurrentUser(updatedUser);
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
}
