import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { NavController } from '@ionic/angular';
import { of, throwError } from 'rxjs';
import { AppError } from 'src/app/core/models/app-error.model';
import { ProfileErrorFacade } from '../../errors/profile-error.facade';
import { UserProfileResponseDto } from '../../services/profile-api.service';
import { ProfileService } from '../../services/profile.service';
import { UserProfilePage } from './user-profile.page';

const mockProfile: UserProfileResponseDto = {
  id: '1',
  username: 'jane',
  displayName: 'Jane',
  bio: 'bio',
  avatarUrl: 'https://cdn.example.com/avatar.jpg',
  postsCount: 0,
  videosCount: 0,
  followersCount: 0,
  followingCount: 0,
  isFollowing: false,
  hasStory: false,
};

describe('UserProfilePage', () => {
  let component: UserProfilePage;
  let fixture: ComponentFixture<UserProfilePage>;
  let profileServiceSpy: jasmine.SpyObj<ProfileService>;
  let profileErrorFacadeSpy: jasmine.SpyObj<ProfileErrorFacade>;

  beforeEach(async () => {
    profileServiceSpy = jasmine.createSpyObj('ProfileService', ['getUserProfile']);
    profileErrorFacadeSpy = jasmine.createSpyObj('ProfileErrorFacade', [
      'handle',
      'getMessage',
    ]);
    profileServiceSpy.getUserProfile.and.returnValue(of(mockProfile));

    await TestBed.configureTestingModule({
      imports: [UserProfilePage],
      providers: [
        { provide: NavController, useValue: jasmine.createSpyObj('NavController', ['back']) },
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigateByUrl']) },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: '1' })),
          },
        },
        {
          provide: ProfileService,
          useValue: profileServiceSpy,
        },
        {
          provide: ProfileErrorFacade,
          useValue: profileErrorFacadeSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should stop loading after successful profile fetch', () => {
    component.userProfile();
    expect(component.isLoading()).toBeFalse();
  });

  it('should stop loading and call facade when profile fetch fails', async () => {
    const error: AppError = { status: 500, handled: false };
    profileServiceSpy.getUserProfile.and.returnValue(throwError(() => error));

    fixture = TestBed.createComponent(UserProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.userProfile();

    expect(component.isLoading()).toBeFalse();
    expect(profileErrorFacadeSpy.handle).toHaveBeenCalled();
  });
});
