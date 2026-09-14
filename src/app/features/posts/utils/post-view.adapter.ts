import { AuthUserDto } from '@features/auth/models/auth.dto';
import { Post } from '@features/home/components/post-card/post-card.component';
import { PostResponseDto } from '../models/post.dto';

const DEFAULT_USER_AVATAR = 'assets/images/users/user43.png';

/**
 * Maps a server Post + session author data to the feed view-model.
 * The API does not embed author info in PostResponseDto, so it comes
 * from the authenticated session (v1: users only see their own new posts).
 */
export function toFeedPost(
  dto: PostResponseDto,
  author: AuthUserDto | null,
  imageUrl: string
): Post {
  return {
    id: dto.id,
    userProfilePic: author?.avatarUrl || DEFAULT_USER_AVATAR,
    userName: author?.displayName || author?.username || 'You',
    username: author?.username ?? '',
    aboutPost: dto.content ?? '',
    createdAt: dto.createdAt,
    postLikes: '0',
    postComments: '0',
    postShares: '0',
    postSaves: '0',
    postSaved: false,
    postImage: imageUrl,
    postImages: imageUrl ? [imageUrl] : [],
    postLike: false,
  };
}
