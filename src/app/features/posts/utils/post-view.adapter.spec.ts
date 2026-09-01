import { AuthUserDto } from '@features/auth/models/auth.dto';
import { PostResponseDto } from '../models/post.dto';
import { toFeedPost } from './post-view.adapter';

describe('post-view.adapter', () => {
  const POST_DTO: PostResponseDto = {
    id: 'post-1',
    authorId: 'user-1',
    content: 'hello world',
    media: [
      {
        id: 'ref-1',
        mediaFileId: 'media-1',
        position: 0,
        publicUrl: 'https://storage.example.com/uploads/post.jpg',
        mimeType: 'image/jpeg',
      },
    ],
    status: 'published',
    createdAt: '2026-08-25T00:00:00Z',
    updatedAt: '2026-08-25T00:00:00Z',
  };

  const AUTHOR: AuthUserDto = {
    id: 'user-1',
    email: 'a@b.com',
    emailVerified: true,
    username: 'tester',
    displayName: 'Tester One',
    avatarUrl: 'https://cdn.example.com/avatar.png',
  };

  it('should map dto + author to the feed view model', () => {
    const post = toFeedPost(POST_DTO, AUTHOR, 'blob:image-src');

    expect(post).toEqual({
      id: 'post-1',
      userProfilePic: 'https://cdn.example.com/avatar.png',
      userName: 'Tester One',
      userDetail: '',
      aboutPost: 'hello world',
      postLikes: '0',
      postComments: '0',
      postShares: '0',
      postImage: 'blob:image-src',
      postLike: false,
    });
  });

  it('should fall back to username and default avatar without author data', () => {
    const noAvatar = { ...AUTHOR, avatarUrl: null, displayName: null };
    const post = toFeedPost(POST_DTO, noAvatar, 'blob:x');
    expect(post.userName).toBe('tester');
    expect(post.userProfilePic).toContain('assets/images/users/');

    const postNoAuthor = toFeedPost(POST_DTO, null, 'blob:x');
    expect(postNoAuthor.userName).toBe('You');
  });

  it('should map null content to empty caption', () => {
    const post = toFeedPost({ ...POST_DTO, content: null }, AUTHOR, 'blob:x');
    expect(post.aboutPost).toBe('');
  });
});
