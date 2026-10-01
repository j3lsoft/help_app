import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { signal } from '@angular/core';
import { Subject, of } from 'rxjs';
import { PostsApiService } from '@features/posts/services/posts-api.service';
import { PaginatedPostsResponseDto } from '@features/posts/models/post.dto';
import { ProfileService } from '@features/profile/services/profile.service';
import { FollowApiService } from '@features/profile/services/follow-api.service';
import { RelationshipService } from '@features/profile/services/relationship.service';
import { AuthService } from '@features/auth/services/auth.service';
import { FeedService } from '@features/home/services/feed.service';
import { Post } from '@features/posts/models/post-view.model';
import { LoggerService } from '@core/services/logger.service';
import { ErrorFacade } from '@core/errors/facades/error.facade';
import { ProfilePage } from './profile.page';

describe('ProfilePage', () => {
  let component: ProfilePage;
  let fixture: ComponentFixture<ProfilePage>;
  let postsApiSpy: jasmine.SpyObj<PostsApiService>;

  beforeEach(waitForAsync(() => {
    postsApiSpy = jasmine.createSpyObj('PostsApiService', ['getUserPosts']);
    postsApiSpy.getUserPosts.and.returnValue(
      of({ items: [], nextCursor: null, total: 0 }),
    );

    const authSpy = {
      currentUser: signal({ id: 'u1', username: 'test', displayName: 'Test', avatarUrl: null, email: 'a@b.com', emailVerified: true }),
    } as unknown as AuthService;

    const profileSpy = jasmine.createSpyObj('ProfileService', ['getMyProfile']);
    (profileSpy as unknown as { currentProfile: ReturnType<typeof signal> }).currentProfile = signal(null);
    profileSpy.getMyProfile.and.returnValue(of({ id: 'u1', username: 'test', displayName: 'Test', avatarUrl: null, bio: null, website: null, email: 'a@b.com', emailVerified: true, birthDate: null }));

    const followApiSpy = jasmine.createSpyObj('FollowApiService', [
      'getSocialState',
      'follow',
      'unfollow',
    ]);
    followApiSpy.getSocialState.and.returnValue(
      of({ followerCount: 0, followeeCount: 0, isFollowing: false }),
    );

    TestBed.configureTestingModule({
      imports: [ProfilePage],
      providers: [
        provideRouter([]),
        provideIonicAngular(),
        { provide: PostsApiService, useValue: postsApiSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: ProfileService, useValue: profileSpy },
        { provide: FollowApiService, useValue: followApiSpy },
        RelationshipService,
        { provide: ErrorFacade, useValue: jasmine.createSpyObj('ErrorFacade', ['handle', 'getMessage']) },
        { provide: LoggerService, useValue: jasmine.createSpyObj('LoggerService', ['error', 'debug', 'info', 'warn']) },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should initialize with empty posts and zero count', () => {
    expect(component.profilePosts()).toEqual([]);
    expect(component.postsCount()).toBe('0');
  });

  it('should handle post click navigation', () => {
    expect(() => component.goToPostDetail('123')).not.toThrow();
  });

  it('should navigate to the detail pinned to the tapped image', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl');

    component.goToPostDetail('p1', 2);

    expect(router.navigateByUrl).toHaveBeenCalledWith('post-detail/p1?image=2');
  });

  it('should default to the posts tab', () => {
    expect(component.activeTab()).toBe('posts');
  });

  it('should load first posts page and reflect total count', () => {
    postsApiSpy.getUserPosts.and.returnValue(
      of({
        items: [
          {
            id: 'p1',
            authorId: 'u1',
            content: 'hi',
            media: [
              {
                id: 'm1',
                mediaFileId: 'file-1',
                position: 0,
                publicUrl: 'https://cdn.example.com/p1.jpg',
                mimeType: 'image/jpeg',
              },
            ],
            status: 'published',
            createdAt: '2026-08-25T00:00:00Z',
            updatedAt: '2026-08-25T00:00:00Z',
          },
        ],
        nextCursor: 'next-page',
        total: 5,
      }),
    );

    component.ionViewWillEnter();

    expect(component.profilePosts().length).toBe(1);
    expect(component.postCards().length).toBe(1);
    expect(component.postCards()[0].postImages).toEqual([
      'https://cdn.example.com/p1.jpg',
    ]);
    expect(component.mediaItems().length).toBe(1);
    expect(component.mediaUrls()).toEqual(['https://cdn.example.com/p1.jpg']);
    expect(component.postsCount()).toBe('5');
  });

  it('should refresh posts on re-entering without clearing the current list', () => {
    const post = {
      id: 'p1',
      authorId: 'u1',
      content: 'hi',
      media: [],
      status: 'published' as const,
      createdAt: '2026-08-25T00:00:00Z',
      updatedAt: '2026-08-25T00:00:00Z',
    };
    postsApiSpy.getUserPosts.and.returnValue(
      of({ items: [post], nextCursor: null, total: 1 }),
    );

    component.ionViewWillEnter();
    expect(component.profilePosts().length).toBe(1);

    const refresh$ = new Subject<PaginatedPostsResponseDto>();
    postsApiSpy.getUserPosts.and.returnValue(refresh$);
    component.ionViewWillEnter();

    expect(component.profilePosts().length).toBe(1);
    expect(component.isLoadingPosts()).toBeFalse();

    refresh$.next({
      items: [{ ...post, content: 'edited' }],
      nextCursor: null,
      total: 1,
    });
    refresh$.complete();

    expect(component.profilePosts()[0].content).toBe('edited');
    expect(component.isLoadingPosts()).toBeFalse();
  });

  const SERVER_POST = {
    id: 'p1',
    authorId: 'u1',
    content: 'hi',
    media: [
      {
        id: 'm1',
        mediaFileId: 'file-1',
        position: 0,
        publicUrl: 'https://cdn.example.com/p1.jpg',
        mimeType: 'image/jpeg',
      },
    ],
    status: 'published' as const,
    createdAt: '2026-08-25T00:00:00Z',
    updatedAt: '2026-08-25T00:00:00Z',
  };

  it('should drop a post tombstoned elsewhere in the app, in the grid and the Media tab', () => {
    postsApiSpy.getUserPosts.and.returnValue(
      of({ items: [SERVER_POST], nextCursor: null, total: 1 }),
    );

    component.ionViewWillEnter();
    expect(component.postCards().length).toBe(1);
    expect(component.mediaItems().length).toBe(1);

    TestBed.inject(FeedService).removePost('p1');

    expect(component.postCards().length).toBe(0);
    expect(component.mediaItems().length).toBe(0);
  });

  it('should prepend a session-created post before the server pages', () => {
    const fresh: Post = {
      id: 'new',
      userProfilePic: '',
      userName: 'Test',
      username: 'test',
      aboutPost: 'fresh',
      postLikes: '0',
      postComments: '0',
      postSaves: '0',
      postSaved: false,
      postImages: [],
      postLike: false,
    };

    TestBed.inject(FeedService).prependPost(fresh, 'u1');
    fixture.detectChanges();

    expect(component.postCards()[0].id).toBe('new');
  });
});
