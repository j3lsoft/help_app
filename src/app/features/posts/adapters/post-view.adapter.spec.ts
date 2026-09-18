import { AuthUserDto } from '@features/auth/models/auth.dto';
import { PostResponseDto } from '../models/post.dto';
import {
  collectPostImages,
  postImageUrls,
  toPostView,
} from './post-view.adapter';

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

  it('maps dto + author to the feed view model using server media urls', () => {
    const post = toPostView(POST_DTO, {
      author: AUTHOR,
      fallbackImageUrls: ['blob:image-src'],
    });

    expect(post).toEqual({
      id: 'post-1',
      userProfilePic: 'https://cdn.example.com/avatar.png',
      userName: 'Tester One',
      username: 'tester',
      aboutPost: 'hello world',
      postLikes: '0',
      postComments: '0',
      postShares: '0',
      postSaves: '0',
      postSaved: false,
      postImage: 'https://storage.example.com/uploads/post.jpg',
      postImages: ['https://storage.example.com/uploads/post.jpg'],
      postLike: false,
      createdAt: '2026-08-25T00:00:00Z',
    });
  });

  it('orders carousel urls by media position', () => {
    const dto: PostResponseDto = {
      ...POST_DTO,
      media: [
        {
          id: 'ref-2',
          mediaFileId: 'media-2',
          position: 1,
          publicUrl: 'https://cdn.example.com/second.jpg',
          mimeType: 'image/jpeg',
        },
        {
          id: 'ref-1',
          mediaFileId: 'media-1',
          position: 0,
          publicUrl: 'https://cdn.example.com/first.jpg',
          mimeType: 'image/jpeg',
        },
      ],
    };

    expect(postImageUrls(dto)).toEqual([
      'https://cdn.example.com/first.jpg',
      'https://cdn.example.com/second.jpg',
    ]);
  });

  it('falls back to local urls when publicUrl is missing', () => {
    const dto: PostResponseDto = {
      ...POST_DTO,
      media: [
        {
          id: 'ref-1',
          mediaFileId: 'media-1',
          position: 0,
          publicUrl: '',
          mimeType: 'image/jpeg',
        },
      ],
    };

    expect(postImageUrls(dto, ['blob:local'])).toEqual(['blob:local']);
  });

  it('falls back to username and an empty avatar without author data', () => {
    const noAvatar = { ...AUTHOR, avatarUrl: null, displayName: null };
    const post = toPostView(POST_DTO, { author: noAvatar, fallbackImageUrls: 'blob:x' });
    expect(post.userName).toBe('tester');
    expect(post.userProfilePic).toBe('');

    const postNoAuthor = toPostView(POST_DTO, { author: null, fallbackImageUrls: 'blob:x' });
    expect(postNoAuthor.userName).toBe('You');
    expect(postNoAuthor.userProfilePic).toBe('');
  });

  it('maps null content to empty caption', () => {
    const post = toPostView(
      { ...POST_DTO, content: null },
      { author: AUTHOR, fallbackImageUrls: 'blob:x' },
    );
    expect(post.aboutPost).toBe('');
  });

  it('maps text-only posts with empty image url', () => {
    const textOnly = { ...POST_DTO, media: [] };
    const post = toPostView(textOnly, { author: AUTHOR, fallbackImageUrls: '' });
    expect(post.postImage).toBe('');
    expect(post.postImages).toEqual([]);
    expect(post.aboutPost).toBe('hello world');
  });

  it('collects ordered media refs across posts', () => {
    const second: PostResponseDto = {
      ...POST_DTO,
      id: 'post-2',
      media: [
        {
          id: 'ref-2',
          mediaFileId: 'media-2',
          position: 1,
          publicUrl: 'https://cdn.example.com/two-b.jpg',
          mimeType: 'image/jpeg',
        },
        {
          id: 'ref-3',
          mediaFileId: 'media-3',
          position: 0,
          publicUrl: 'https://cdn.example.com/two-a.jpg',
          mimeType: 'image/jpeg',
        },
      ],
    };
    const textOnly: PostResponseDto = { ...POST_DTO, id: 'post-3', media: [] };

    expect(collectPostImages([POST_DTO, second, textOnly])).toEqual([
      {
        postId: 'post-1',
        index: 0,
        image: 'https://storage.example.com/uploads/post.jpg',
      },
      { postId: 'post-2', index: 0, image: 'https://cdn.example.com/two-a.jpg' },
      { postId: 'post-2', index: 1, image: 'https://cdn.example.com/two-b.jpg' },
    ]);
  });
});
