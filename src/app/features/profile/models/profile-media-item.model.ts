/**
 * A single media piece flattened from a user's posts, used by the profile
 * Media tab. `key` is unique per post+position so it can be used as an
 * `@for` track key, while `postId` links back to the originating post.
 */
export interface ProfileMediaItem {
  key: string;
  image: string;
  postId: string;
}
