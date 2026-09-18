import { Injectable, signal } from '@angular/core';
import { MOCK_OLD_POSTS, MOCK_TODAY_POSTS } from '../data/home.mock';
import { Post } from '@features/posts/models/post-view.model';

/**
 * Local feed state as a single chronological list, newest first.
 * v1 has no read endpoint yet, so published posts are
 * inserted optimistically on top of the list.
 */
@Injectable({
  providedIn: 'root',
})
export class FeedService {
  private readonly _posts = signal<Post[]>([
    ...MOCK_TODAY_POSTS,
    ...MOCK_OLD_POSTS,
  ]);

  readonly posts = this._posts.asReadonly();

  prependPost(post: Post): void {
    this._posts.update((posts) => [post, ...posts]);
  }

  updatePostContent(postId: string, content: string): void {
    this._posts.update((posts) =>
      posts.map((p) => (p.id === postId ? { ...p, aboutPost: content } : p))
    );
  }

  removePost(postId: string): void {
    this._posts.update((posts) => posts.filter((p) => p.id !== postId));
  }

  toggleLike(postId: string): void {
    this._posts.update((posts) =>
      posts.map((p) => (p.id === postId ? { ...p, postLike: !p.postLike } : p))
    );
  }

  toggleSave(postId: string): void {
    this._posts.update((posts) =>
      posts.map((p) => (p.id === postId ? { ...p, postSaved: !p.postSaved } : p))
    );
  }
}
