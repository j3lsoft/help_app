import { Signal, computed, signal } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { LoggerService } from '@core/services/logger.service';
import { createPaginatedListState } from '@core/state/paginated-list.state';
import { loadPaginatedPage } from '@core/utils/paginated-list-loader.utils';
import { toAppError } from '@core/utils/app-error.utils';
import {
  PaginatedPostsResponseDto,
  PostResponseDto,
} from '@features/posts/models/post.dto';

/** Dependencies required by the profile posts loader. */
export interface ProfilePostsLoaderDeps {
  /** Fetches one page of a user's posts; `cursor` is undefined for the first page. */
  fetchPage: (
    userId: string,
    cursor?: string | null,
  ) => Observable<PaginatedPostsResponseDto>;
  logger: LoggerService;
}

export interface ProfilePostsLoader {
  /** Raw server posts, newest first, accumulated across pages. */
  readonly posts: Signal<PostResponseDto[]>;
  readonly isLoading: Signal<boolean>;
  readonly hasMore: Signal<boolean>;
  readonly postsCount: Signal<string>;
  readonly notFound: Signal<boolean>;
  loadFirst(userId: string): void;
  loadMore(userId: string, onSettled?: () => void): void;
  destroy(): void;
}

/**
 * Shared paginated state for Profile Posts (My Profile and PublicProfile).
 * Accumulates pages via an opaque cursor, tracks the backend `total` when
 * present (only returned with `includeTotal=true`), and
 * applies the 422 reset-and-retry policy on any page load.
 *
 * Keeps the full `PostResponseDto` so consumers can derive both the feed
 * `Post` view-model (Posts tab) and the flattened media (Media tab).
 */
export function createProfilePostsLoader({
  fetchPage,
  logger,
}: ProfilePostsLoaderDeps): ProfilePostsLoader {
  const state = createPaginatedListState<PostResponseDto>();
  const totalPosts = signal<number | undefined>(undefined);

  let sub: Subscription | undefined;
  let scopeUserId: string | null = null;
  let retriedFor: string | null = null;

  const posts = state.items.asReadonly();
  const isLoading = state.loading.asReadonly();
  const hasMore = state.hasMore.asReadonly();
  const notFound = computed(() => state.error()?.status === 404);
  const postsCount = computed(() => {
    const total = totalPosts();
    return total !== undefined ? String(total) : String(posts().length);
  });

  function loadPage(userId: string, reset: boolean) {
    if (reset) {
      // Avoid stale total when switching users or reloading: total is
      // only re-set when the backend returns a number (includeTotal=true).
      totalPosts.set(undefined);
    }
    return loadPaginatedPage({
      reset,
      scopeKey: userId,
      currentScopeKey: {
        get: () => scopeUserId,
        set: (key) => {
          scopeUserId = key;
        },
      },
      state,
      fetch: (cursor) => fetchPage(userId, cursor),
      mapItems: (items) => items,
      onTotal: (total) => totalPosts.set(total),
      logContext: 'profile posts',
      logger,
    });
  }

  function loadFirst(userId: string): void {
    retriedFor = null;
    scopeUserId = userId;
    sub?.unsubscribe();
    sub = loadPage(userId, true).subscribe({
      error: (error: unknown) => handleError(error, userId),
    });
  }

  function loadMore(userId: string, onSettled?: () => void): void {
    const cursor = state.cursor();
    if (!cursor || state.loading()) {
      onSettled?.();
      return;
    }
    sub?.unsubscribe();
    sub = loadPage(userId, false).subscribe({
      complete: onSettled,
      error: (error: unknown) => {
        onSettled?.();
        handleError(error, userId);
      },
    });
  }

  function handleError(error: unknown, userId: string): void {
    const appError = toAppError(error);
    if (appError.status === 422 && retriedFor !== userId) {
      retriedFor = userId;
      loadFirst(userId);
    }
  }

  function destroy(): void {
    sub?.unsubscribe();
  }

  return { posts, isLoading, hasMore, postsCount, notFound, loadFirst, loadMore, destroy };
}
