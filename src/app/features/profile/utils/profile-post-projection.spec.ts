import { PostAuthor, Post } from '@features/posts/models/post-view.model';
import { PostResponseDto } from '@features/posts/models/post.dto';
import {
  CreatedPostEntry,
  EMPTY_POST_OVERRIDES,
} from '@features/posts/utils/post-overrides.util';
import { projectProfilePosts } from './profile-post-projection';

const AUTHOR: PostAuthor = {
  username: 'alice',
  displayName: 'Alice',
  avatarUrl: null,
};

function dto(id: string, content = 'server'): PostResponseDto {
  return {
    id,
    authorId: 'u1',
    content,
    media: [],
    status: 'published',
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  };
}

function created(id: string, authorId: string): CreatedPostEntry {
  const post: Post = {
    id,
    userProfilePic: '',
    userName: 'Alice',
    username: 'alice',
    aboutPost: 'fresh',
    postLikes: '0',
    postComments: '0',
    postShares: '0',
    postSaves: '0',
    postSaved: false,
    postImage: '',
    postImages: [],
    postLike: false,
  };
  return { post, authorId };
}

describe('projectProfilePosts', () => {
  it('projects server pages with the profile author', () => {
    const posts = projectProfilePosts({
      dtos: [dto('p1')],
      author: AUTHOR,
      authorId: 'u1',
      createdPosts: [],
      overrides: EMPTY_POST_OVERRIDES,
    });

    expect(posts.length).toBe(1);
    expect(posts[0].id).toBe('p1');
    expect(posts[0].userName).toBe('Alice');
  });

  it('drops a tombstoned server post', () => {
    const posts = projectProfilePosts({
      dtos: [dto('p1'), dto('p2')],
      author: AUTHOR,
      authorId: 'u1',
      createdPosts: [],
      overrides: { ...EMPTY_POST_OVERRIDES, removedIds: new Set(['p1']) },
    });

    expect(posts.map((p) => p.id)).toEqual(['p2']);
  });

  it('prepends session-created posts for the matching author', () => {
    const posts = projectProfilePosts({
      dtos: [dto('p1')],
      author: AUTHOR,
      authorId: 'u1',
      createdPosts: [created('new', 'u1')],
      overrides: EMPTY_POST_OVERRIDES,
    });

    expect(posts.map((p) => p.id)).toEqual(['new', 'p1']);
  });

  it('ignores created posts from another author', () => {
    const posts = projectProfilePosts({
      dtos: [dto('p1')],
      author: AUTHOR,
      authorId: 'u1',
      createdPosts: [created('other', 'u2')],
      overrides: EMPTY_POST_OVERRIDES,
    });

    expect(posts.map((p) => p.id)).toEqual(['p1']);
  });

  it('prefers the canonical server copy of a created post once it is returned', () => {
    const posts = projectProfilePosts({
      dtos: [dto('new', 'canonical')],
      author: AUTHOR,
      authorId: 'u1',
      createdPosts: [created('new', 'u1')],
      overrides: EMPTY_POST_OVERRIDES,
    });

    expect(posts.length).toBe(1);
    expect(posts[0].aboutPost).toBe('canonical');
  });

  it('filters a created post once it is tombstoned', () => {
    const posts = projectProfilePosts({
      dtos: [],
      author: AUTHOR,
      authorId: 'u1',
      createdPosts: [created('new', 'u1')],
      overrides: { ...EMPTY_POST_OVERRIDES, removedIds: new Set(['new']) },
    });

    expect(posts).toEqual([]);
  });
});
