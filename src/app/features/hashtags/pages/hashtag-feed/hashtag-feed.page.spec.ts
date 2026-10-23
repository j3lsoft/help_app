import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { of, throwError } from 'rxjs';
import { FeedApiService } from '@features/home/services/feed-api.service';
import { FeedService } from '@features/home/services/feed.service';
import { PostResponseDto } from '@features/posts/models/post.dto';
import { PostsApiService } from '@features/posts/services/posts-api.service';
import { ErrorFacade } from '@core/errors/facades/error.facade';
import { HashtagFeedPage } from './hashtag-feed.page';

const POST_DTO: PostResponseDto = {
  id: 'p1',
  authorId: 'u1',
  content: 'hello #travel',
  media: [],
  hashtags: ['travel'],
  status: 'published',
  createdAt: '2026-10-20T10:00:00Z',
  updatedAt: '2026-10-20T10:00:00Z',
};

describe('HashtagFeedPage', () => {
  let component: HashtagFeedPage;
  let fixture: ComponentFixture<HashtagFeedPage>;
  let postsApiSpy: jasmine.SpyObj<PostsApiService>;

  beforeEach(async () => {
    postsApiSpy = jasmine.createSpyObj('PostsApiService', [
      'getPostsByHashtag',
    ]);
    postsApiSpy.getPostsByHashtag.and.returnValue(
      of({ items: [POST_DTO], nextCursor: null, total: 1 })
    );

    await TestBed.configureTestingModule({
      imports: [HashtagFeedPage],
      providers: [
        provideRouter([]),
        provideIonicAngular(),
        { provide: PostsApiService, useValue: postsApiSpy },
        {
          provide: FeedApiService,
          useValue: jasmine.createSpyObj('FeedApiService', ['getFeed']),
        },
        { provide: ErrorFacade, useValue: jasmine.createSpyObj('ErrorFacade', ['handle']) },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ tag: 'travel' }) } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HashtagFeedPage);
    component = fixture.componentInstance;
    component.ionViewWillEnter();
    fixture.detectChanges();
  });

  it('should request the tag page and render the projected posts', () => {
    expect(postsApiSpy.getPostsByHashtag).toHaveBeenCalledWith('travel', {
      limit: 20,
    });
    expect(component.tag).toBe('travel');
    expect(component.posts().length).toBe(1);
    expect(component.posts()[0].id).toBe('p1');
    expect(component.hasMore()).toBeFalse();
  });

  it('should show a neutral author fallback until the backend embeds one', () => {
    expect(component.posts()[0].userName).toBe('Unknown author');
    expect(component.posts()[0].username).toBe('');
  });

  it('should drop posts tombstoned elsewhere in the app', () => {
    TestBed.inject(FeedService).removePost('p1');

    expect(component.posts()).toEqual([]);
  });

  it('should surface failures through the facade and keep the stale list', () => {
    postsApiSpy.getPostsByHashtag.and.returnValue(
      throwError(() => ({ status: 400, handled: false }))
    );

    component.ionViewWillEnter();

    expect(TestBed.inject(ErrorFacade).handle).toHaveBeenCalled();
    expect(component.loaded()).toBeTrue();
    // Stale-while-revalidate: the last good list stays visible.
    expect(component.posts().length).toBe(1);
  });
});
