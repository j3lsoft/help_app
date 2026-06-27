import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { LoggerService } from '@core/services/logger.service';
import { environment } from '@env/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  FollowCountsResponseDto,
  FollowRelationResponseDto,
  FollowStatusResponseDto,
  PaginatedFollowersResponseDto,
  PaginatedSuggestionsResponseDto,
} from '../models/social.dto';

@Injectable({
  providedIn: 'root',
})
export class FollowApiService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/social`;
  private readonly http = inject(HttpClient);
  private readonly logger = inject(LoggerService);

  follow(followeeId: string): Observable<FollowRelationResponseDto> {
    this.logger.debug('Following user', {
      context: 'FollowApiService',
      data: { followeeId },
    });

    return this.http
      .post<FollowRelationResponseDto>(
        `${this.baseUrl}/${followeeId}/follow`,
        null
      )
      .pipe(
        catchError((error: unknown) => {
          this.logger.error('Failed to follow user', {
            context: 'FollowApiService',
            data: { followeeId, error },
          });
          return throwError(() => error);
        })
      );
  }

  unfollow(followeeId: string): Observable<void> {
    this.logger.debug('Unfollowing user', {
      context: 'FollowApiService',
      data: { followeeId },
    });

    return this.http
      .delete<void>(`${this.baseUrl}/${followeeId}/follow`)
      .pipe(
        catchError((error: unknown) => {
          this.logger.error('Failed to unfollow user', {
            context: 'FollowApiService',
            data: { followeeId, error },
          });
          return throwError(() => error);
        })
      );
  }

  getFollowers(
    userId: string,
    cursor?: string,
    limit = 20
  ): Observable<PaginatedFollowersResponseDto> {
    this.logger.debug('Fetching followers', {
      context: 'FollowApiService',
      data: { userId, cursor, limit },
    });

    let params = new HttpParams().set('limit', limit);
    if (cursor) params = params.set('cursor', cursor);

    return this.http
      .get<PaginatedFollowersResponseDto>(
        `${this.baseUrl}/${userId}/followers`,
        { params }
      )
      .pipe(
        catchError((error: unknown) => {
          this.logger.error('Failed to fetch followers', {
            context: 'FollowApiService',
            data: { userId, error },
          });
          return throwError(() => error);
        })
      );
  }

  getFollowing(
    userId: string,
    cursor?: string,
    limit = 20
  ): Observable<PaginatedFollowersResponseDto> {
    this.logger.debug('Fetching following', {
      context: 'FollowApiService',
      data: { userId, cursor, limit },
    });

    let params = new HttpParams().set('limit', limit);
    if (cursor) params = params.set('cursor', cursor);

    return this.http
      .get<PaginatedFollowersResponseDto>(
        `${this.baseUrl}/${userId}/following`,
        { params }
      )
      .pipe(
        catchError((error: unknown) => {
          this.logger.error('Failed to fetch following', {
            context: 'FollowApiService',
            data: { userId, error },
          });
          return throwError(() => error);
        })
      );
  }

  getFollowStatus(followeeId: string): Observable<FollowStatusResponseDto> {
    this.logger.debug('Fetching follow status', {
      context: 'FollowApiService',
      data: { followeeId },
    });

    return this.http
      .get<FollowStatusResponseDto>(
        `${this.baseUrl}/${followeeId}/status`
      )
      .pipe(
        catchError((error: unknown) => {
          this.logger.error('Failed to fetch follow status', {
            context: 'FollowApiService',
            data: { followeeId, error },
          });
          return throwError(() => error);
        })
      );
  }

  getFollowCounts(userId: string): Observable<FollowCountsResponseDto> {
    this.logger.debug('Fetching follow counts', {
      context: 'FollowApiService',
      data: { userId },
    });

    return this.http
      .get<FollowCountsResponseDto>(`${this.baseUrl}/${userId}/counts`)
      .pipe(
        catchError((error: unknown) => {
          this.logger.error('Failed to fetch follow counts', {
            context: 'FollowApiService',
            data: { userId, error },
          });
          return throwError(() => error);
        })
      );
  }

  getSuggestions(
    cursor?: string,
    limit = 20
  ): Observable<PaginatedSuggestionsResponseDto> {
    this.logger.debug('Fetching suggestions', {
      context: 'FollowApiService',
      data: { cursor, limit },
    });

    let params = new HttpParams().set('limit', limit);
    if (cursor) params = params.set('cursor', cursor);

    return this.http
      .get<PaginatedSuggestionsResponseDto>(`${this.baseUrl}/suggestions`, {
        params,
      })
      .pipe(
        catchError((error: unknown) => {
          this.logger.error('Failed to fetch suggestions', {
            context: 'FollowApiService',
            data: { error },
          });
          return throwError(() => error);
        })
      );
  }
}
