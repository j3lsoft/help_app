import { Post } from '../models/post-view.model';

/**
 * Session-local engagement overlay for one Post. Flags are absolute (the
 * intended state) and deltas are applied on top of the server/base count, so a
 * list that never fetched the Post can still render the user's like/save.
 */
export interface PostEngagementOverride {
  postLike?: boolean;
  postSaved?: boolean;
  likeDelta?: number;
  saveDelta?: number;
}

/** A removed Post, kept as a tombstone so later pages cannot resurrect it. */
export interface RemovedPostEntry {
  /** The feed copy, when the Post also lived in the feed; `null` for API-only Posts. */
  post: Post | null;
  /** Index in the feed at removal time, so a rollback restores its place. */
  index: number;
}

/** A Post created this session, tagged with its author for per-profile projection. */
export interface CreatedPostEntry {
  post: Post;
  authorId: string;
}

/**
 * Read-only snapshot of every session-local mutation a list must apply on top
 * of its own server data. Produced by `FeedService.overrides` (see ADR 0007).
 */
export interface PostOverrides {
  removedIds: ReadonlySet<string>;
  contentPatches: ReadonlyMap<string, string>;
  engagement: ReadonlyMap<string, PostEngagementOverride>;
}

export const EMPTY_POST_OVERRIDES: PostOverrides = {
  removedIds: new Set(),
  contentPatches: new Map(),
  engagement: new Map(),
};

/**
 * Applies a tombstone, an edited caption and a like/save overlay to one Post.
 * Returns `null` when the Post was removed, so callers can `filter` it out.
 */
export function applyPostOverrides(
  post: Post,
  overrides: PostOverrides,
): Post | null {
  if (overrides.removedIds.has(post.id)) {
    return null;
  }

  let next = post;

  const content = overrides.contentPatches.get(post.id);
  if (content !== undefined) {
    next = { ...next, aboutPost: content };
  }

  const engagement = overrides.engagement.get(post.id);
  if (engagement) {
    next = {
      ...next,
      postLike: engagement.postLike ?? next.postLike,
      postSaved: engagement.postSaved ?? next.postSaved,
      postLikes: engagement.likeDelta
        ? (shiftPostCount(next.postLikes, engagement.likeDelta) ?? next.postLikes)
        : next.postLikes,
      postSaves: engagement.saveDelta
        ? (shiftPostCount(next.postSaves, engagement.saveDelta) ?? next.postSaves)
        : next.postSaves,
    };
  }

  return next;
}

/**
 * Shifts a formatted count by `delta`. Only plain integer strings are shifted;
 * already-abbreviated values ("10k") are left untouched rather than corrupted.
 */
export function shiftPostCount(
  value: string | undefined,
  delta: number,
): string | undefined {
  if (!value) {
    return value;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return value;
  }
  return String(Math.max(0, parsed + delta));
}
