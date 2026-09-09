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
      userDetail: '',
      aboutPost: 'hi',
      postLikes: '0',
      postComments: '0',
      postShares: '0',
      postImage: 'blob:image-src',
      postImages: ['blob:image-src'],
      postLike: false,
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
});
