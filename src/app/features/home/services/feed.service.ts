import { Injectable, computed, signal } from '@angular/core';
import { MOCK_OLD_POSTS, MOCK_TODAY_POSTS } from '../data/home.mock';
import { Post } from '@features/posts/models/post-view.model';
import {
  CreatedPostEntry,
  PostEngagementOverride,
  PostOverrides,
  RemovedPostEntry,
} from '@features/posts/utils/post-overrides.util';

/**
 * Local feed state as a single chronological list, newest first.
 * v1 has no read endpoint yet, so published posts are
 * inserted optimistically on top of the list.
 *
 * It also owns the session-local mutation log (tombstones, caption patches,
 * engagement and created posts) that every list projects on its own server
 * data, so a delete/edit/like anywhere is visible everywhere immediately.
 */
@Injectable({
  providedIn: 'root',
})
export class FeedService {
  private readonly _posts = signal<Post[]>([
    ...MOCK_TODAY_POSTS,
    ...MOCK_OLD_POSTS,
  ]);

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

  readonly posts = this._posts.asReadonly();

  /** Mutations every list applies on top of its own server data. */
  readonly overrides = computed<PostOverrides>(() => ({
    removedIds: new Set(this._removed().keys()),
    contentPatches: this._contentPatches(),
    engagement: this._engagement(),
  }));

  /** Posts created this session, newest first, tagged with their author. */
  readonly createdPosts = this._createdPosts.asReadonly();

  prependPost(post: Post, authorId?: string): void {
    this._posts.update((posts) => [post, ...posts]);
    if (authorId) {
      this._createdPosts.update((entries) => [
        { post, authorId },
        ...entries,
      ]);
    }
  }

  updatePostContent(postId: string, content: string): void {
    this._posts.update((posts) =>
      posts.map((p) => (p.id === postId ? { ...p, aboutPost: content } : p))
    );
    this._contentPatches.update((patches) =>
      new Map(patches).set(postId, content)
    );
  }

  removePost(postId: string): void {
    const posts = this._posts();
    const index = posts.findIndex((p) => p.id === postId);
    const found = index >= 0 ? posts[index] : null;
    if (index >= 0) {
      this._posts.update((current) => current.filter((p) => p.id !== postId));
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
      this._posts.update((posts) => {
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
   * Flips the feed copy's own flag and records the absolute flag plus the
   * count delta that lists without server engagement project on top of their
   * base (see `applyPostOverrides`).
   */
  private toggleEngagement(
    postId: string,
    flag: 'postLike' | 'postSaved',
    deltaKey: 'likeDelta' | 'saveDelta'
  ): void {
    const current = this._engagement().get(postId) ?? {};
    const nextFlag = !(current[flag] ?? false);
    const nextDelta = (current[deltaKey] ?? 0) + (nextFlag ? 1 : -1);

    this._posts.update((posts) =>
      posts.map((p) => {
        if (p.id !== postId) {
          return p;
        }
        return flag === 'postLike'
          ? { ...p, postLike: !p.postLike }
          : { ...p, postSaved: !p.postSaved };
      })
    );

    this._engagement.update((map) =>
      new Map(map).set(postId, {
        ...current,
        [flag]: nextFlag,
        [deltaKey]: nextDelta,
      })
    );
  }

  /** Clears every session-local mutation (e.g. on logout). */
  reset(): void {
    this._posts.set([...MOCK_TODAY_POSTS, ...MOCK_OLD_POSTS]);
    this._removed.set(new Map());
    this._contentPatches.set(new Map());
    this._engagement.set(new Map());
    this._createdPosts.set([]);
  }
}
