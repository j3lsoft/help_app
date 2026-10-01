import { TestBed } from '@angular/core/testing';
import { FeedService } from './feed.service';
import { MOCK_OLD_POSTS, MOCK_TODAY_POSTS } from '../data/home.mock';

describe('FeedService', () => {
  let service: FeedService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FeedService);
  });

  it('should be created with a single chronological seed list', () => {
    expect(service.posts()).toEqual([...MOCK_TODAY_POSTS, ...MOCK_OLD_POSTS]);
  });

  it('should prepend a new post on top of the list', () => {
    const newPost = {
      id: 'new-post',
      userProfilePic: '',
      userName: 'Tester',
      username: 'tester',
      aboutPost: 'hi',
      postLikes: '0',
      postComments: '0',
      postImages: ['blob:image-src'],
      postLike: false,
      createdAt: '2026-09-13T00:00:00Z',
    };

    service.prependPost(newPost);

    expect(service.posts()[0]).toEqual(newPost);
    expect(service.posts().length).toBe(
      MOCK_TODAY_POSTS.length + MOCK_OLD_POSTS.length + 1
    );
  });

  it('should toggle like for a specific post', () => {
    const target = MOCK_TODAY_POSTS[0];

    service.toggleLike(target.id);
    expect(service.posts()[0].postLike).toBe(!target.postLike);

    service.toggleLike(target.id);
    expect(service.posts()[0].postLike).toBe(target.postLike);
  });

  it('should toggle save for a specific post', () => {
    const target = MOCK_TODAY_POSTS[0];

    service.toggleSave(target.id);
    expect(service.posts()[0].postSaved).toBe(!target.postSaved);

    service.toggleSave(target.id);
    expect(service.posts()[0].postSaved).toBe(target.postSaved);
  });

  it('should update the content of a post in place', () => {
    const target = MOCK_TODAY_POSTS[0];

    service.updatePostContent(target.id, 'edited content');

    expect(service.posts()[0].aboutPost).toBe('edited content');
    expect(service.posts().length).toBe(
      MOCK_TODAY_POSTS.length + MOCK_OLD_POSTS.length
    );
  });

  it('should remove a post without touching the others', () => {
    const target = MOCK_TODAY_POSTS[0];
    const before = service.posts().length;

    service.removePost(target.id);

    expect(service.posts().length).toBe(before - 1);
    expect(service.posts().some((p) => p.id === target.id)).toBeFalse();
  });

  it('should record a tombstone so every list can drop the post', () => {
    const target = MOCK_TODAY_POSTS[0];

    service.removePost(target.id);

    expect(service.overrides().removedIds.has(target.id)).toBeTrue();
  });

  it('should restore a removed post at its original position on rollback', () => {
    const target = MOCK_TODAY_POSTS[0];
    const before = service.posts();

    service.removePost(target.id);
    service.restorePost(target.id);

    expect(service.overrides().removedIds.has(target.id)).toBeFalse();
    expect(service.posts()).toEqual(before);
  });

  it('should expose edited content as an overlay for other lists', () => {
    const target = MOCK_TODAY_POSTS[0];

    service.updatePostContent(target.id, 'patched');

    expect(service.overrides().contentPatches.get(target.id)).toBe('patched');
  });

  it('should expose like/save as an engagement overlay', () => {
    const target = MOCK_TODAY_POSTS[0];

    service.toggleLike(target.id);
    service.toggleSave(target.id);

    const engagement = service.overrides().engagement.get(target.id);
    expect(engagement?.postLike).toBeTrue();
    expect(engagement?.likeDelta).toBe(1);
    expect(engagement?.postSaved).toBeTrue();
    expect(engagement?.saveDelta).toBe(1);
  });

  it('should track session-created posts by author', () => {
    const newPost = { ...MOCK_TODAY_POSTS[0], id: 'mine' };

    service.prependPost(newPost, 'u1');

    expect(service.createdPosts().length).toBe(1);
    expect(service.createdPosts()[0]).toEqual({ post: newPost, authorId: 'u1' });
  });

  it('should clear every session-local mutation on reset', () => {
    const target = MOCK_TODAY_POSTS[0];
    service.removePost(target.id);
    service.updatePostContent(target.id, 'patched');
    service.toggleLike(target.id);
    service.prependPost({ ...target, id: 'mine' }, 'u1');

    service.reset();

    expect(service.posts()).toEqual([...MOCK_TODAY_POSTS, ...MOCK_OLD_POSTS]);
    expect(service.overrides().removedIds.size).toBe(0);
    expect(service.overrides().contentPatches.size).toBe(0);
    expect(service.overrides().engagement.size).toBe(0);
    expect(service.createdPosts()).toEqual([]);
  });
});
