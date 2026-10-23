import { Injectable, computed, inject, signal } from '@angular/core';
import { EMPTY, Observable, finalize, map, tap } from 'rxjs';
import { Post } from '@features/posts/models/post-view.model';
import {
  CreatedPostEntry,
  PostEngagementOverride,
  PostOverrides,
  RemovedPostEntry,
  applyPostOverrides,
} from '@features/posts/utils/post-overrides.util';
import { toFeedPostView } from '../adapters/feed-post-view.adapter';
import { FeedApiService } from './feed-api.service';

const FEED_PAGE_SIZE = 20;

/**
 * Home Feed state. The list is server-driven (`GET /api/v1/feed`, cursor
 * pagination) and every entry is projected through the session-local mutation
 * log (tombstones, caption patches, engagement and created posts), so a
 * delete/edit/like anywhere is visible everywhere immediately (see
 * docs/adr/0007).
 *
 * Posts created this session are merged on top of the server pages until the
 * next refresh brings them in from the API; duplicates are collapsed by id.
 */
@Injectable({
  providedIn: 'root',
})
export class FeedService {
  private readonly api = inject(FeedApiService);

  private readonly _serverPosts = signal<readonly Post[]>([]);
  private readonly _nextCursor = signal<string | null>(null);
  private readonly _loadingMore = signal(false);
  private readonly _refreshing = signal(false);

  private readonly _removed = signal<ReadonlyMap<string, RemovedPostEntry>>(
    new Map()
  );
  private readonly _contentPatches = signal<ReadonlyMap<string, string>>(
    new Map()
  );
  private readonly _engagement = signal<
    ReadonlyMap<string, PostEngagementOverride>
  >(new Map());
  private readonly _createdPosts = signal<readonly CreatedPostEntry[]>([]);

  /** A page fetch is in flight: the infinite scroll spinner is showing. */
  readonly loadingMore = this._loadingMore.asReadonly();
  /** A first-page fetch is in flight: the pull-to-refresh spinner is showing. */
  readonly refreshing = this._refreshing.asReadonly();
  /** Whether the cursor points to a further page. */
  readonly hasMore = computed(() => this._nextCursor() !== null);

  /** Posts created this session, newest first, tagged with their author. */
  readonly createdPosts = this._createdPosts.asReadonly();

  /** Mutations every list applies on top of its own server data. */
  readonly overrides = computed<PostOverrides>(() => ({
    removedIds: new Set(this._removed().keys()),
    contentPatches: this._contentPatches(),
    engagement: this._engagement(),
  }));

  /** Session-created posts first, then the server pages, newest first. */
  readonly posts = computed<Post[]>(() => {
    const overrides = this.overrides();
    const seen = new Set<string>();
    const projected: Post[] = [];

    for (const entry of this._createdPosts()) {
      if (overrides.removedIds.has(entry.post.id) || seen.has(entry.post.id)) {
        continue;
      }
      seen.add(entry.post.id);
      projected.push(applyPostOverrides(entry.post, overrides) as Post);
    }

    for (const post of this._serverPosts()) {
      if (seen.has(post.id)) {
        continue;
      }
      const next = applyPostOverrides(post, overrides);
      if (next) {
        seen.add(post.id);
        projected.push(next);
      }
    }

    return projected;
  });

  /** Replaces the list with a fresh first page. */
  refresh(): Observable<void> {
    if (this._refreshing()) {
      return EMPTY;
    }
    this._refreshing.set(true);

    return this.api.getFeed({ limit: FEED_PAGE_SIZE }).pipe(
      tap((page) => {
        this._serverPosts.set(page.items.map(toFeedPostView));
        this._nextCursor.set(page.nextCursor);
      }),
      map(() => void 0),
      finalize(() => this._refreshing.set(false))
    );
  }

  /** Appends the next page behind the current cursor. */
  loadMore(): Observable<void> {
    const cursor = this._nextCursor();
    if (!cursor || this._loadingMore() || this._refreshing()) {
      return EMPTY;
    }
    this._loadingMore.set(true);

    return this.api.getFeed({ limit: FEED_PAGE_SIZE, cursor }).pipe(
      tap((page) => {
        this._serverPosts.update((posts) => [
          ...posts,
          ...page.items.map(toFeedPostView),
        ]);
        this._nextCursor.set(page.nextCursor);
      }),
      map(() => void 0),
      finalize(() => this._loadingMore.set(false))
    );
  }

  prependPost(post: Post, authorId?: string): void {
    if (authorId) {
      this._createdPosts.update((entries) => [
        { post, authorId },
        ...entries,
      ]);
      return;
    }
    this._serverPosts.update((posts) => [post, ...posts]);
  }

  updatePostContent(postId: string, content: string): void {
    this._contentPatches.update((patches) =>
      new Map(patches).set(postId, content)
    );
  }

  removePost(postId: string): void {
    const posts = this._serverPosts();
    const index = posts.findIndex((p) => p.id === postId);
    const found = index >= 0 ? (posts[index] as Post) : null;
    if (index >= 0) {
      this._serverPosts.update((current) =>
        current.filter((p) => p.id !== postId)
      );
    }
    this._removed.update((removed) =>
      new Map(removed).set(postId, { post: found, index })
    );
  }

  /** Reverses an optimistic `removePost` (failed delete rollback). */
  restorePost(postId: string): void {
    const entry = this._removed().get(postId);
    this._removed.update((removed) => {
      if (!removed.has(postId)) {
        return removed;
      }
      const next = new Map(removed);
      next.delete(postId);
      return next;
    });
    if (entry?.post) {
      this._serverPosts.update((posts) => {
        if (posts.some((p) => p.id === postId)) {
          return posts;
        }
        const next = [...posts];
        const at = entry.index >= 0 ? Math.min(entry.index, next.length) : 0;
        next.splice(at, 0, entry.post as Post);
        return next;
      });
    }
  }

  toggleLike(postId: string): void {
    this.toggleEngagement(postId, 'postLike', 'likeDelta');
  }

  toggleSave(postId: string): void {
    this.toggleEngagement(postId, 'postSaved', 'saveDelta');
  }

  /**
   * Records the absolute flag plus the count delta; the projected list flips
   * its own state from the overlay (see `applyPostOverrides`).
   */
  private toggleEngagement(
    postId: string,
    flag: 'postLike' | 'postSaved',
    deltaKey: 'likeDelta' | 'saveDelta'
  ): void {
    const current = this._engagement().get(postId) ?? {};
    const nextFlag = !(current[flag] ?? false);
    const nextDelta = (current[deltaKey] ?? 0) + (nextFlag ? 1 : -1);

    this._engagement.update((map) =>
      new Map(map).set(postId, {
        ...current,
        [flag]: nextFlag,
        [deltaKey]: nextDelta,
      })
    );
  }

  /** Clears every session-local mutation and the fetched pages (e.g. on logout). */
  reset(): void {
    this._serverPosts.set([]);
    this._nextCursor.set(null);
    this._removed.set(new Map());
    this._contentPatches.set(new Map());
    this._engagement.set(new Map());
    this._createdPosts.set([]);
  }
}
