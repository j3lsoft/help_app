import { Injectable, signal } from '@angular/core';
import { MOCK_OLD_POSTS, MOCK_TODAY_POSTS } from '../data/home.mock';
import { Post } from '../components/post-card/post-card.component';

/**
 * Local feed state. v1 has no read endpoint yet, so published posts are
 * inserted optimistically on top of today's list.
 */
@Injectable({
  providedIn: 'root',
})
export class FeedService {
  private readonly _todaysPosts = signal<Post[]>(MOCK_TODAY_POSTS);
  private readonly _oldPosts = signal<Post[]>(MOCK_OLD_POSTS);

  readonly todaysPosts = this._todaysPosts.asReadonly();
  readonly oldPosts = this._oldPosts.asReadonly();

  prependPost(post: Post): void {
    this._todaysPosts.update((posts) => [post, ...posts]);
  }

  toggleLike(list: 'today' | 'old', postId: string): void {
    const signalToUpdate =
      list === 'today' ? this._todaysPosts : this._oldPosts;
    signalToUpdate.update((posts) =>
      posts.map((p) => (p.id === postId ? { ...p, postLike: !p.postLike } : p))
    );
  }
}
