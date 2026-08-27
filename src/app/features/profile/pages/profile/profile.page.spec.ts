import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { PostsApiService } from '@features/posts/services/posts-api.service';
import { ProfileService } from '@features/profile/services/profile.service';
import { FollowService } from '@features/profile/services/follow.service';
import { AuthService } from '@features/auth/services/auth.service';
import { ProfileErrorFacade } from '../../errors/profile-error.facade';
import { SocialErrorFacade } from '../../errors/social-error.facade';
import { ProfilePage } from './profile.page';

describe('ProfilePage', () => {
  let component: ProfilePage;
  let fixture: ComponentFixture<ProfilePage>;

  beforeEach(waitForAsync(() => {
    const postsApiSpy = jasmine.createSpyObj('PostsApiService', ['getPostsByAuthor']);
    postsApiSpy.getPostsByAuthor.and.returnValue(of([]));

    const authSpy = {
      currentUser: signal({ id: 'u1', username: 'test', displayName: 'Test', avatarUrl: null, email: 'a@b.com', emailVerified: true }),
    } as unknown as AuthService;

    const profileSpy = jasmine.createSpyObj('ProfileService', ['getMyProfile']);
    (profileSpy as unknown as { currentProfile: ReturnType<typeof signal> }).currentProfile = signal(null);
    profileSpy.getMyProfile.and.returnValue(of({ id: 'u1', username: 'test', displayName: 'Test', avatarUrl: null, bio: null, website: null, email: 'a@b.com', emailVerified: true, birthDate: null }));

    const followSpy = jasmine.createSpyObj('FollowService', ['loadSocialState']);
    (followSpy as unknown as { followerCount: ReturnType<typeof signal> }).followerCount = signal(0);
    (followSpy as unknown as { followingCount: ReturnType<typeof signal> }).followingCount = signal(0);
    followSpy.loadSocialState.and.returnValue(of(void 0));

    TestBed.configureTestingModule({
      imports: [ProfilePage],
      providers: [
        provideRouter([]),
        provideIonicAngular(),
        { provide: PostsApiService, useValue: postsApiSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: ProfileService, useValue: profileSpy },
        { provide: FollowService, useValue: followSpy },
        { provide: ProfileErrorFacade, useValue: jasmine.createSpyObj('ProfileErrorFacade', ['handle']) },
        { provide: SocialErrorFacade, useValue: jasmine.createSpyObj('SocialErrorFacade', ['handle']) },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty posts and zero count', () => {
    expect(component.profilePosts()).toEqual([]);
    expect(component.postsCount()).toBe('0');
  });

  it('should handle post click navigation', () => {
    expect(() => component.onPostClick({ id: '123', image: 'img' })).not.toThrow();
  });
});
