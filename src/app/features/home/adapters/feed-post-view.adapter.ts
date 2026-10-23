import { Post } from '@features/posts/models/post-view.model';
import { FeedItemResponseDto } from '../models/feed.dto';

/**
 * Maps one feed item to the shared Post view-model.
 *
 * The feed embeds the author, so the card renders real handles instead of the
 * session fallback. Engagement totals are absent from the contract, so the
 * counters are left `undefined` and the card hides them rather than inventing
 * numbers (see docs/adr/0011).
 */
export function toFeedPostView(item: FeedItemResponseDto): Post {
  const postImages = [...item.media]
    .sort((a, b) => a.position - b.position)
    .map((media) => media.publicUrl)
    .filter((url) => url.trim().length > 0);

  return {
    id: item.id,
    userProfilePic: item.author.avatarUrl ?? '',
    userName: item.author.displayName || item.author.username,
    username: item.author.username,
    aboutPost: item.content ?? '',
    createdAt: item.createdAt,
    postImages,
    postLike: false,
    postSaved: false,
  };
}
