import { Injectable, inject, signal } from '@angular/core';
import { AuthService } from '@features/auth/services/auth.service';
import { LoggerService } from '@core/services/logger.service';
import { createPaginatedListState } from '@core/state/paginated-list.state';
import { loadPaginatedPage } from '@core/utils/paginated-list-loader.utils';
import { toAppError } from '@core/utils/app-error.utils';
import {
  Observable,
  Subscription,
  catchError,
  map,
  of,
  throwError,
} from 'rxjs';
import { tap } from 'rxjs/operators';
import { SocialResponseAdapter } from '../adapters/social-response.adapter';
import {
  FollowCountsResponseDto,
  FollowRelationResponseDto,
} from '../models/social.dto';
import {
  FollowRequestItem,
  FollowUserDto,
} from '../models/follow.dto';
import { MOCK_FOLLOW_REQUESTS } from '../data/profile.mock';
import { FollowApiService } from './follow-api.service';

@Injectable({
  providedIn: 'root',
})
export class FollowService {
  private readonly followApi = inject(FollowApiService);
  private readonly authService = inject(AuthService);
  private readonly logger = inject(LoggerService);

  private readonly followersState = createPaginatedListState<FollowUserDto>();
  private readonly followingsState = createPaginatedListState<FollowUserDto>();
  private readonly suggestionsState = createPaginatedListState<FollowUserDto>();

  readonly followers = this.followersState.items.asReadonly();
  readonly followings = this.followingsState.items.asReadonly();
  readonly suggestions = this.suggestionsState.items.asReadonly();

  readonly followersLoading = this.followersState.loading.asReadonly();
  readonly followingsLoading = this.followingsState.loading.asReadonly();
  readonly suggestionsLoading = this.suggestionsState.loading.asReadonly();

  readonly followersError = this.followersState.error.asReadonly();
  readonly followingsError = this.followingsState.error.asReadonly();
  readonly suggestionsError = this.suggestionsState.error.asReadonly();

  readonly hasMoreFollowers = this.followersState.hasMore.asReadonly();
  readonly hasMoreFollowings = this.followingsState.hasMore.asReadonly();
  readonly hasMoreSuggestions = this.suggestionsState.hasMore.asReadonly();

  readonly followRequests = signal<FollowRequestItem[]>(MOCK_FOLLOW_REQUESTS);

  readonly followerCount = signal(0);
  readonly followingCount = signal(0);

  private _currentFollowersUserId: string | null = null;
  private _currentFollowingsUserId: string | null = null;
  private _countsUserId: string | null = null;

  private loadFollowCountsSub?: Subscription;

  loadFollowers(userId: string, reset = false): Observable<void> {
    return loadPaginatedPage({
      reset,
      scopeKey: userId,
      currentScopeKey: {
        get: () => this._currentFollowersUserId,
        set: (key) => {
          this._currentFollowersUserId = key;
        },
      },
      state: this.followersState,
      fetch: (cursor) => this.followApi.getFollowers(userId, cursor),
      mapItems: (items) =>
        SocialResponseAdapter.followerListToFollowUserList(items),
      logContext: 'followers',
      logger: this.logger,
    });
  }

  refreshFollowers(userId: string): Observable<void> {
    return this.loadFollowers(userId, true);
  }

  loadFollowings(userId: string, reset = false): Observable<void> {
    return loadPaginatedPage({
      reset,
      scopeKey: userId,
      currentScopeKey: {
        get: () => this._currentFollowingsUserId,
        set: (key) => {
          this._currentFollowingsUserId = key;
        },
      },
      state: this.followingsState,
      fetch: (cursor) => this.followApi.getFollowing(userId, cursor),
      mapItems: (items) =>
        SocialResponseAdapter.followerListToFollowUserList(items),
      logContext: 'followings',
      logger: this.logger,
    });
  }

  refreshFollowings(userId: string): Observable<void> {
    return this.loadFollowings(userId, true);
  }

  refreshSuggestions(): Observable<void> {
    return this.loadSuggestions(true);
  }

  loadSuggestions(reset = false): Observable<void> {
    return loadPaginatedPage({
      reset,
      state: this.suggestionsState,
      fetch: (cursor) => this.followApi.getSuggestions(cursor),
      mapItems: (items) =>
        SocialResponseAdapter.suggestionListToFollowUserList(items),
      logContext: 'suggestions',
      logger: this.logger,
    });
  }

  follow(followeeId: string): Observable<FollowRelationResponseDto> {
    return this.followApi.follow(followeeId).pipe(
      tap(() => {
        this.logger.info('Followed user', {
          context: 'FollowService',
          data: { followeeId },
        });
      }),
      catchError((error: unknown) => {
        const appError = toAppError(error);
        this.logger.error('Failed to follow user', {
          context: 'FollowService',
          data: { followeeId, error: appError },
        });
        return throwError(() => appError);
      })
    );
  }

  unfollow(followeeId: string): Observable<void> {
    return this.followApi.unfollow(followeeId).pipe(
      tap(() => {
        this.logger.info('Unfollowed user', {
          context: 'FollowService',
          data: { followeeId },
        });
      }),
      catchError((error: unknown) => {
        const appError = toAppError(error);
        this.logger.error('Failed to unfollow user', {
          context: 'FollowService',
          data: { followeeId, error: appError },
        });
        return throwError(() => appError);
      })
    );
  }

  toggleFollow(userId: string, currentlyFollowing: boolean): Observable<void> {
    if (currentlyFollowing) {
      this.updateFollowStateInLists(userId, false);
      this.adjustOwnFollowingCount(-1);

      return this.unfollow(userId).pipe(
        map(() => void 0),
        catchError((error) => {
          this.updateFollowStateInLists(userId, true);
          this.adjustOwnFollowingCount(1);
          return throwError(() => error);
        })
      );
    }

    this.updateFollowStateInLists(userId, true);
    this.adjustOwnFollowingCount(1);

    return this.follow(userId).pipe(
      map(() => void 0),
      catchError((error) => {
        this.updateFollowStateInLists(userId, false);
        this.adjustOwnFollowingCount(-1);
        return throwError(() => error);
      })
    );
  }

  private adjustOwnFollowingCount(delta: number): void {
    const authUserId = this.authService.currentUser()?.id;
    if (!authUserId || this._countsUserId !== authUserId) {
      return;
    }

    this.followingCount.update((count) => Math.max(0, count + delta));
  }

  private updateFollowStateInLists(id: string, isFollow: boolean): void {
    this.followersState.items.update((items) =>
      items.map((item) => (item.id === id ? { ...item, isFollow } : item))
    );
    this.followingsState.items.update((items) =>
      items.map((item) => (item.id === id ? { ...item, isFollow } : item))
    );
    this.suggestionsState.items.update((items) =>
      items.map((item) => (item.id === id ? { ...item, isFollow } : item))
    );
  }

  toggleFollowOnRequest(id: string): void {
    this.followRequests.update((items) =>
      items.map((item) =>
        item.id === id ? { ...item, isFollow: !item.isFollow } : item
      )
    );
  }

  acceptRequest(id: string): void {
    this.followRequests.update((items) =>
      items.map((item) =>
        item.id === id ? { ...item, acceptRequest: true } : item
      )
    );
  }

  rejectRequest(id: string): void {
    this.followRequests.update((items) =>
      items.filter((item) => item.id !== id)
    );
  }

  getFollowCounts(userId: string): Observable<FollowCountsResponseDto> {
    return this.followApi.getFollowCounts(userId).pipe(
      catchError((error: unknown) => {
        const appError = toAppError(error);
        this.logger.error('Failed to get follow counts', {
          context: 'FollowService',
          data: { userId, error: appError },
        });
        return throwError(() => appError);
      })
    );
  }

  loadFollowCounts(userId: string): Observable<void> {
    this.loadFollowCountsSub?.unsubscribe();
    this._countsUserId = userId;

    return new Observable<void>((observer) => {
      this.loadFollowCountsSub = this.getFollowCounts(userId).subscribe({
        next: (counts) => {
          if (this._countsUserId !== userId) return;
          this.followerCount.set(counts.followerCount);
          this.followingCount.set(counts.followeeCount);
          observer.next();
          observer.complete();
        },
        error: (error: unknown) => {
          if (this._countsUserId === userId) {
            this._countsUserId = null;
          }
          observer.error(error);
        },
      });

      return () => this.loadFollowCountsSub?.unsubscribe();
    });
  }
}
