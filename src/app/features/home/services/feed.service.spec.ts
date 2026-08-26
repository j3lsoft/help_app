import { TestBed } from '@angular/core/testing';
import { FeedService } from './feed.service';
import { MOCK_OLD_POSTS, MOCK_TODAY_POSTS } from '../data/home.mock';

describe('FeedService', () => {
  let service: FeedService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FeedService);
  });

  it('should be created with mock seed data', () => {
    expect(service.todaysPosts()).toEqual(MOCK_TODAY_POSTS);
    expect(service.oldPosts()).toEqual(MOCK_OLD_POSTS);
  });

  it('should prepend a new post on top of today list', () => {
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
      postLike: false,
    };

    service.prependPost(newPost);

    expect(service.todaysPosts()[0]).toEqual(newPost);
    expect(service.todaysPosts().length).toBe(MOCK_TODAY_POSTS.length + 1);
  });

  it('should toggle like for a specific post in a given list', () => {
    const target = MOCK_TODAY_POSTS[0];

    service.toggleLike('today', target.id);
    expect(service.todaysPosts()[0].postLike).toBe(!target.postLike);

    service.toggleLike('today', target.id);
    expect(service.todaysPosts()[0].postLike).toBe(target.postLike);
  });
});
