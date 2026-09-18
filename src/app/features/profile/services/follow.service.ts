import { Injectable, inject, signal } from '@angular/core';
import { LoggerService } from '@core/services/logger.service';
import { createPaginatedListState } from '@core/state/paginated-list.state';
import { loadPaginatedPage } from '@core/utils/paginated-list-loader.utils';
import { Observable } from 'rxjs';
import { SocialResponseAdapter } from '../adapters/social-response.adapter';
import { MOCK_FOLLOW_REQUESTS } from '../data/profile.mock';
import { FollowRequestItem, FollowUserDto } from '../models/follow.dto';
import { FollowApiService } from './follow-api.service';
import { RelationshipService } from './relationship.service';

/**
 * Paginated FollowUser lists (followers, followings, suggestions) plus the
 * in-memory follow-request placeholders.
 *
 * Relationship state itself lives in `RelationshipService`: fetched pages are
 * primed into it here, and `FollowUserDto.isFollow` is only the server value
 * used for that priming, not the rendering authority.
 */
@Injectable({
  providedIn: 'root',
})
export class FollowService {
  private readonly followApi = inject(FollowApiService);
  private readonly relationships = inject(RelationshipService);
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

  private _currentFollowersUserId: string | null = null;
  private _currentFollowingsUserId: string | null = null;

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
        this.primeRelationships(
          SocialResponseAdapter.followerListToFollowUserList(items),
        ),
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
        this.primeRelationships(
          SocialResponseAdapter.followerListToFollowUserList(items),
        ),
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
      // Suggestions carry no server relationship (the adapter synthesises
      // `isFollow: false`), so they must not overwrite store state.
      mapItems: (items) => SocialResponseAdapter.suggestionListToFollowUserList(items),
      logContext: 'suggestions',
      logger: this.logger,
    });
  }

  toggleFollowOnRequest(id: string): void {
    this.followRequests.update((items) =>
      items.map((item) =>
        item.id === id ? { ...item, isFollow: !item.isFollow } : item,
      ),
    );
  }

  acceptRequest(id: string): void {
    this.followRequests.update((items) =>
      items.map((item) =>
        item.id === id ? { ...item, acceptRequest: true } : item,
      ),
    );
  }

  rejectRequest(id: string): void {
    this.followRequests.update((items) =>
      items.filter((item) => item.id !== id),
    );
  }

  /** Enters a mapped page's relationship data into the store once. */
  private primeRelationships(users: FollowUserDto[]): FollowUserDto[] {
    for (const user of users) {
      this.relationships.prime(user.id, {
        isFollowing: user.isFollow,
        followsYou: user.followsYou,
      });
    }
    return users;
  }
}
