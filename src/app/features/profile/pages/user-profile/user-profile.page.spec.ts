import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { NavController } from '@ionic/angular';
import { of, throwError } from 'rxjs';
import { AppError } from '@core/models/app-error.model';
import { ProfileErrorFacade } from '../../errors/profile-error.facade';
import { SocialErrorFacade } from '../../errors/social-error.facade';
import { PublicProfileResponseDto } from '../../services/profile-api.service';
import { ProfileService } from '../../services/profile.service';
import { FollowService } from '../../services/follow.service';
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
  let profileErrorFacadeSpy: jasmine.SpyObj<ProfileErrorFacade>;
  let followServiceSpy: jasmine.SpyObj<FollowService>;

  beforeEach(async () => {
    profileServiceSpy = jasmine.createSpyObj('ProfileService', ['getPublicProfile']);
    profileErrorFacadeSpy = jasmine.createSpyObj('ProfileErrorFacade', [
      'handle',
      'getMessage',
    ]);
    followServiceSpy = jasmine.createSpyObj('FollowService', [
      'getFollowCounts',
      'toggleFollow',
    ]);

    profileServiceSpy.getPublicProfile.and.returnValue(of(mockProfile));
    followServiceSpy.getFollowCounts.and.returnValue(
      of({ followerCount: 10, followeeCount: 5 })
    );
    followServiceSpy.toggleFollow.and.returnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [UserProfilePage],
      providers: [
        { provide: NavController, useValue: jasmine.createSpyObj('NavController', ['back']) },
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigateByUrl']) },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ username: 'jane' })),
          },
        },
        { provide: ProfileService, useValue: profileServiceSpy },
        { provide: ProfileErrorFacade, useValue: profileErrorFacadeSpy },
        { provide: SocialErrorFacade, useValue: jasmine.createSpyObj('SocialErrorFacade', ['handle']) },
        { provide: FollowService, useValue: followServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load profile by username', () => {
    expect(profileServiceSpy.getPublicProfile).toHaveBeenCalledWith('jane');
    expect(component.userProfile.value()).toEqual(mockProfile);
  });

  it('should load follow counts for the profile user id', () => {
    expect(followServiceSpy.getFollowCounts).toHaveBeenCalledWith('1');
    expect(component.followerCount()).toBe(10);
    expect(component.followingCount()).toBe(5);
  });

  it('should call facade when profile fetch fails', async () => {
    const error: AppError = { status: 500, handled: false };
    profileServiceSpy.getPublicProfile.and.returnValue(throwError(() => error));

    fixture = TestBed.createComponent(UserProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(profileErrorFacadeSpy.handle).toHaveBeenCalled();
  });
});
