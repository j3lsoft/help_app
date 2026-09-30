import { PostResponseDto } from '@features/posts/models/post.dto';
import { Post, PostAuthor } from '@features/posts/models/post-view.model';
import { toPostView } from '@features/posts/adapters/post-view.adapter';
import {
  CreatedPostEntry,
  PostOverrides,
  applyPostOverrides,
} from '@features/posts/utils/post-overrides.util';

export interface ProfilePostProjectionArgs {
  /** Server posts accumulated by the paginated loader. */
  dtos: readonly PostResponseDto[];
  author: PostAuthor | null;
  /** Author id of the profile being rendered; used to place session-created posts. */
  authorId: string | null;
  createdPosts: readonly CreatedPostEntry[];
  overrides: PostOverrides;
}

/**
 * Projects a profile's Posts: server pages plus the session-created Posts of
 * that author, with tombstones/caption/engagement applied so the list reacts to
 * mutations made anywhere else in the app. Session-created Posts win over a
 * server copy of the same id to avoid duplicates.
 */
export function projectProfilePosts({
  dtos,
  author,
  authorId,
  createdPosts,
  overrides,
}: ProfilePostProjectionArgs): Post[] {
  const fromServer = dtos
    .map((dto) => applyPostOverrides(toPostView(dto, { author }), overrides))
    .filter((post): post is Post => post !== null);

  // The session copy gives instant feedback after publishing, but once the
  // server returns the Post its copy wins (canonical media URLs, not blobs).
  const serverIds = new Set(fromServer.map((post) => post.id));
  const created = authorId
    ? createdPosts
        .filter((entry) => entry.authorId === authorId)
        .map((entry) => applyPostOverrides(entry.post, overrides))
        .filter((post): post is Post => post !== null)
        .filter((post) => !serverIds.has(post.id))
    : [];

  return [...created, ...fromServer];
}
