import { computed, signal } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { LoggerService } from '@core/services/logger.service';
import { createPaginatedListState } from '@core/state/paginated-list.state';
import { loadPaginatedPage } from '@core/utils/paginated-list-loader.utils';
import { toAppError } from '@core/utils/app-error.utils';
import { PaginatedPostsResponseDto } from '@features/posts/models/post.dto';
import { PostItem } from '../models/post-item.model';
import { toPostItem } from './profile-view.utils';

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
  readonly posts: ReturnType<
    ReturnType<typeof createPaginatedListState<PostItem>>['items']['asReadonly']
  >;
  readonly isLoading: ReturnType<
    ReturnType<typeof createPaginatedListState<PostItem>>['loading']['asReadonly']
  >;
  readonly hasMore: ReturnType<
    ReturnType<typeof createPaginatedListState<PostItem>>['hasMore']['asReadonly']
  >;
  readonly postsCount: ReturnType<typeof computed<string>>;
  readonly notFound: ReturnType<typeof computed<boolean>>;
  loadFirst(userId: string): void;
  loadMore(userId: string, onSettled?: () => void): void;
  destroy(): void;
}

/**
 * Shared paginated state for Profile Posts (My Profile and PublicProfile).
 * Accumulates pages via an opaque cursor, tracks the backend `total`, and
 * applies the 422 reset-and-retry policy on any page load.
 */
export function createProfilePostsLoader({
  fetchPage,
  logger,
}: ProfilePostsLoaderDeps): ProfilePostsLoader {
  const state = createPaginatedListState<PostItem>();
  const totalPosts = signal(0);

  let sub: Subscription | undefined;
  let scopeUserId: string | null = null;
  let retriedFor: string | null = null;

  const posts = state.items.asReadonly();
  const isLoading = state.loading.asReadonly();
  const hasMore = state.hasMore.asReadonly();
  const notFound = computed(() => state.error()?.status === 404);
  const postsCount = computed(() => {
    const total = totalPosts();
    return total > 0 ? String(total) : String(posts().length);
  });

  function loadPage(userId: string, reset: boolean) {
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
      mapItems: (items) => items.map(toPostItem),
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