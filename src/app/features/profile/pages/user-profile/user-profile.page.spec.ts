import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { NavController } from '@ionic/angular';
import { signal } from '@angular/core';
import { Subject, of, throwError } from 'rxjs';
import { AppError } from '@core/models/app-error.model';
import { LoggerService } from '@core/services/logger.service';
import { AuthService } from '@features/auth/services/auth.service';
import { FeedService } from '@features/home/services/feed.service';
import { ErrorFacade } from '@core/errors/facades/error.facade';
import { PublicProfileResponseDto } from '../../services/profile-api.service';
import { ProfileService } from '../../services/profile.service';
import { FollowApiService } from '../../services/follow-api.service';
import { RelationshipService } from '../../services/relationship.service';
import { PostsApiService } from '@features/posts/services/posts-api.service';
import { PaginatedPostsResponseDto } from '@features/posts/models/post.dto';
import { UserProfilePage } from './user-profile.page';

const mockProfile: PublicProfileResponseDto = {
  id: '1',
  username: 'jane',
  displayName: 'Jane',
  bio: 'bio',
  website: null,
  location: null,
  avatarUrl: 'https://cdn.example.com/avatar.jpg',
  relationship: { isFollowing: false, followsYou: false },
};

describe('UserProfilePage', () => {
  let component: UserProfilePage;
  let fixture: ComponentFixture<UserProfilePage>;
  let profileServiceSpy: jasmine.SpyObj<ProfileService>;
  let errorFacadeSpy: jasmine.SpyObj<ErrorFacade>;
  let followApiSpy: jasmine.SpyObj<FollowApiService>;
  let postsApiSpy: jasmine.SpyObj<PostsApiService>;

  beforeEach(async () => {
    profileServiceSpy = jasmine.createSpyObj('ProfileService', [
      'getPublicProfile',
    ]);
    errorFacadeSpy = jasmine.createSpyObj('ErrorFacade', [
      'handle',
      'getMessage',
    ]);
    followApiSpy = jasmine.createSpyObj('FollowApiService', [
      'getSocialState',
      'follow',
      'unfollow',
    ]);

    profileServiceSpy.getPublicProfile.and.returnValue(of(mockProfile));
    followApiSpy.getSocialState.and.returnValue(
      of({ followerCount: 10, followeeCount: 5, isFollowing: false }),
    );

    postsApiSpy = jasmine.createSpyObj('PostsApiService', ['getUserPosts']);
    postsApiSpy.getUserPosts.and.returnValue(
      of({ items: [], nextCursor: null, total: 0 }),
    );

    await TestBed.configureTestingModule({
      imports: [UserProfilePage],
      providers: [
        {
          provide: NavController,
          useValue: jasmine.createSpyObj('NavController', ['back']),
        },
        {
          provide: Router,
          useValue: jasmine.createSpyObj('Router', ['navigateByUrl']),
        },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ username: 'jane' })),
          },
        },
        { provide: ProfileService, useValue: profileServiceSpy },
        { provide: ErrorFacade, useValue: errorFacadeSpy },
        {
          provide: AuthService,
          useValue: {
            currentUser: signal({
              id: 'viewer-1',
              email: 'viewer@example.com',
              emailVerified: true,
              username: 'viewer',
              displayName: 'Viewer',
              avatarUrl: null,
            }),
          },
        },
        { provide: FollowApiService, useValue: followApiSpy },
        RelationshipService,
        { provide: PostsApiService, useValue: postsApiSpy },
        {
          provide: LoggerService,
          useValue: jasmine.createSpyObj('LoggerService', [
            'error',
            'debug',
            'info',
            'warn',
          ]),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should navigate to the detail pinned to the tapped image', () => {
    const router = TestBed.inject(Router);

    component.goToPostDetail('1', 2);

    expect(router.navigateByUrl).toHaveBeenCalledWith('post-detail/1?image=2');
  });

  it('should load profile by username', () => {
    expect(profileServiceSpy.getPublicProfile).toHaveBeenCalledWith('jane');
    expect(component.profile()).toEqual(mockProfile);
  });

  it('should show the header skeleton while loading and swap it for the header', async () => {
    const pending$ = new Subject<PublicProfileResponseDto>();
    profileServiceSpy.getPublicProfile.and.returnValue(pending$);

    fixture = TestBed.createComponent(UserProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-profile-skeleton')).toBeTruthy();
    expect(el.querySelector('app-profile-header')).toBeFalsy();

    pending$.next(mockProfile);
    pending$.complete();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(el.querySelector('app-profile-skeleton')).toBeFalsy();
    expect(el.querySelector('app-profile-header')).toBeTruthy();
  });

  it('should render an error state instead of a stuck skeleton when loading fails', async () => {
    const error: AppError = { status: 500, handled: false };
    profileServiceSpy.getPublicProfile.and.returnValue(throwError(() => error));

    fixture = TestBed.createComponent(UserProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-profile-skeleton')).toBeFalsy();
    expect(el.querySelector('.user-profile__error-container')).toBeTruthy();
  });

  it('should load social state for the profile user id', async () => {
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve));
    fixture.detectChanges();
    await Promise.resolve();
    expect(followApiSpy.getSocialState).toHaveBeenCalledWith('1');
    expect(component.followerCount()).toBe(10);
    expect(component.followingCount()).toBe(5);
  });

  it('should surface profile fetch failures instead of swallowing them', async () => {
    const error: AppError = { status: 500, handled: false };
    profileServiceSpy.getPublicProfile.and.returnValue(throwError(() => error));

    fixture = TestBed.createComponent(UserProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.profile()).toBeNull();
    expect(component.profileError()).toEqual(error);
    expect(component.isProfileNotFound()).toBeFalse();
  });

  it('should treat a 404 as not found without a retry path', async () => {
    const error: AppError = { status: 404, handled: false };
    profileServiceSpy.getPublicProfile.and.returnValue(throwError(() => error));

    fixture = TestBed.createComponent(UserProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.isProfileNotFound()).toBeTrue();
  });

  it('should refresh posts on re-entering once the profile id is resolved', async () => {
    const post = {
      id: 'p1',
      authorId: '1',
      content: 'hi',
      media: [],
      status: 'published' as const,
      createdAt: '2026-08-25T00:00:00Z',
      updatedAt: '2026-08-25T00:00:00Z',
    };
    postsApiSpy.getUserPosts.and.returnValue(
      of({ items: [post], nextCursor: null, total: 1 }),
    );

    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve));
    fixture.detectChanges();
    await Promise.resolve();

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
  });

  it('should drop a post tombstoned elsewhere in the app', async () => {
    const post = {
      id: 'p1',
      authorId: '1',
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
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.postCards().length).toBe(1);

    TestBed.inject(FeedService).removePost('p1');

    expect(component.postCards().length).toBe(0);
  });
});
