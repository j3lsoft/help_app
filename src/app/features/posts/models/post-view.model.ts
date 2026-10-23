/**
 * UI projection of a server Post, rendered by the post card and profile lists.
 * Kept deliberately close to the legacy template field names; renaming to the
 * domain vocabulary is a separate change.
 */
export interface Post {
  id: string;
  userProfilePic: string;
  userName: string;
  /** Author handle without the leading `@`. */
  username: string;
  aboutPost: string;
  /**
   * Engagement totals. Absent when the source endpoint does not expose them
   * (the Home Feed, today); the card hides unknown counters instead of
   * rendering fabricated numbers (see docs/adr/0011).
   */
  postLikes?: string;
  postComments?: string;
  postSaves?: string;
  postSaved?: boolean;
  /** Ordered carousel images. Empty for text-only Posts. */
  postImages: string[];
  postLike: boolean;
  /** ISO publish date, rendered as relative time in the masthead. */
  createdAt?: string;
}

/**
 * Minimal author fields needed to render a feed Post. Satisfied by both the
 * authenticated `AuthUserDto` (own posts) and `PublicProfileResponseDto`
 * (another user's Profile Posts).
 */
export interface PostAuthor {
  displayName?: string | null;
  username?: string | null;
  avatarUrl?: string | null;
}
