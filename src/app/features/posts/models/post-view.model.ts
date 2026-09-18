/**
 * UI projection of a server Post, rendered by the post card and profile lists.
 * Kept deliberately close to the legacy template field names; renaming to the
 * `CONTEXT.md` vocabulary is a separate change.
 */
export interface Post {
  id: string;
  userProfilePic: string;
  userName: string;
  /** Author handle without the leading `@`. */
  username: string;
  aboutPost: string;
  postLikes: string;
  postComments: string;
  postShares: string;
  postSaves?: string;
  postSaved?: boolean;
  /** First image, or '' for text-only Posts. Deprecated: prefer postImages. */
  postImage: string;
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
