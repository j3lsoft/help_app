import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { LoggerService } from '@core/services/logger.service';
import { environment } from '@env/environment';
import { MeResponseDto } from '@features/auth/models/auth.dto';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UpdateProfileDto } from '../models/update-profile.dto';

export interface UserProfileResponseDto {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  website: string;
  postsCount: number;
  videosCount: number;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  hasStory: boolean;
}

export interface UserRelationshipDto {
  isFollowing: boolean;
  followsYou: boolean;
}

export interface PublicProfileResponseDto {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  website: string | null;
  location: string | null;
  relationship: UserRelationshipDto | null;
}

@Injectable({
  providedIn: 'root',
})
export class ProfileApiService {
  private readonly baseUrl = environment.apiBaseUrl;
  private readonly http = inject(HttpClient);
  private readonly logger = inject(LoggerService);

  updateMe(dto: UpdateProfileDto): Observable<MeResponseDto> {
    this.logger.debug('Updating user profile', {
      context: 'ProfileApiService',
      data: { dto },
    });

    return this.http
      .patch<MeResponseDto>(`${this.baseUrl}/api/v1/users/me`, dto)
      .pipe(
        catchError((error: unknown) => {
          this.logger.error('Failed to update user profile', {
            context: 'ProfileApiService',
            data: {
              error,
            },
          });
          return throwError(() => error);
        })
      );
  }

  getMe(): Observable<MeResponseDto> {
    this.logger.debug('Fetching my profile', {
      context: 'ProfileApiService',
    });

    return this.http.get<MeResponseDto>(`${this.baseUrl}/api/v1/users/me`).pipe(
      catchError((error: unknown) => {
        this.logger.error('Failed to fetch my profile', {
          context: 'ProfileApiService',
          data: { error },
        });
        return throwError(() => error);
      })
    );
  }

  getUserProfile(userId: string): Observable<UserProfileResponseDto> {
    this.logger.debug('Fetching user profile', {
      context: 'ProfileApiService',
      data: { userId },
    });

    return this.http
      .get<UserProfileResponseDto>(`${this.baseUrl}/api/v1/users/${userId}`)
      .pipe(
        catchError((error: unknown) => {
          this.logger.error('Failed to fetch user profile', {
            context: 'ProfileApiService',
            data: {
              userId,
              error,
            },
          });
          return throwError(() => error);
        })
      );
  }

  getPublicProfile(username: string): Observable<PublicProfileResponseDto> {
    this.logger.debug('Fetching public profile by username', {
      context: 'ProfileApiService',
      data: { username },
    });

    return this.http
      .get<PublicProfileResponseDto>(
        `${this.baseUrl}/api/v1/users/${username}/profile`
      )
      .pipe(
        catchError((error: unknown) => {
          this.logger.error('Failed to fetch public profile', {
            context: 'ProfileApiService',
            data: { username, error },
          });
          return throwError(() => error);
        })
      );
  }
}
