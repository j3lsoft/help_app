import { HttpErrorResponse } from '@angular/common/http';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  AlertController,
  LoadingController,
  NavController,
  Platform,
  ToastController,
} from '@ionic/angular/standalone';
import { of, throwError } from 'rxjs';
import { CameraService } from 'src/app/core/services/camera/camera.service';
import { LoggerService } from 'src/app/core/services/logger.service';
import { UploadFacade } from 'src/app/core/services/media/upload/services/upload-facade.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { MeResponseDto } from 'src/app/features/auth/models/auth.dto';
import { AuthService } from 'src/app/features/auth/services/auth.service';
import { DEFAULT_PROFILE_IMAGE_PATH } from '../../constants/profile.constants';
import { ProfileErrorFacade } from '../../errors/profile-error.facade';
import { ProfileService } from '../../services/profile.service';
import { EditProfilePage } from './edit-profile.page';

describe('EditProfilePage', () => {
  let component: EditProfilePage;
  let fixture: ComponentFixture<EditProfilePage>;
  let profileServiceSpy: jasmine.SpyObj<ProfileService>;
  let navCtrlSpy: jasmine.SpyObj<NavController>;
  let profileErrorFacadeSpy: jasmine.SpyObj<ProfileErrorFacade>;
  let authUser: ReturnType<typeof signal<MeResponseDto | null>>;

  const mockUser: MeResponseDto = {
    id: 'u1',
    email: 'a@b.com',
    emailVerified: true,
    username: 'jane',
    displayName: 'Jane',
    avatarUrl: 'https://cdn.example.com/a.png',
    birthDate: '1990-01-01',
    bio: 'Hello',
  };

  beforeEach(async () => {
    authUser = signal<MeResponseDto | null>(mockUser);
    profileServiceSpy = jasmine.createSpyObj('ProfileService', [
      'updateProfile',
    ]);
    navCtrlSpy = jasmine.createSpyObj('NavController', ['back']);
    profileErrorFacadeSpy = jasmine.createSpyObj('ProfileErrorFacade', [
      'handle',
      'getMessage',
    ]);

    const loadingEl = {
      present: () => Promise.resolve(),
      dismiss: () => Promise.resolve(),
    };
    const loadingCtrlSpy = jasmine.createSpyObj('LoadingController', [
      'create',
    ]);
    loadingCtrlSpy.create.and.returnValue(Promise.resolve(loadingEl));

    const toastEl = { present: () => Promise.resolve() };
    const toastCtrlSpy = jasmine.createSpyObj('ToastController', ['create']);
    toastCtrlSpy.create.and.returnValue(Promise.resolve(toastEl));

    const alertCtrlSpy = jasmine.createSpyObj('AlertController', ['create']);
    alertCtrlSpy.create.and.returnValue(
      Promise.resolve({ present: () => Promise.resolve() })
    );

    const loggerSpy = jasmine.createSpyObj('LoggerService', [
      'error',
      'debug',
      'info',
      'warn',
    ]);

    const uploadFacadeSpy = jasmine.createSpyObj('UploadFacade', [
      'setUploadType',
      'addFile',
    ]);
    uploadFacadeSpy.queue = signal([]);

    await TestBed.configureTestingModule({
      imports: [EditProfilePage],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            currentUser: authUser.asReadonly(),
            fetchUserProfile: jasmine
              .createSpy('fetchUserProfile')
              .and.returnValue(Promise.resolve(mockUser)),
          },
        },
        { provide: ProfileService, useValue: profileServiceSpy },
        { provide: NavController, useValue: navCtrlSpy },
        { provide: LoadingController, useValue: loadingCtrlSpy },
        { provide: ToastController, useValue: toastCtrlSpy },
        { provide: AlertController, useValue: alertCtrlSpy },
        { provide: LoggerService, useValue: loggerSpy },
        { provide: UploadFacade, useValue: uploadFacadeSpy },
        { provide: ProfileErrorFacade, useValue: profileErrorFacadeSpy },
        {
          provide: CameraService,
          useValue: jasmine.createSpyObj('CameraService', [
            'takePhoto',
            'selectFromGallery',
          ]),
        },
        {
          provide: NotificationService,
          useValue: jasmine.createSpyObj('NotificationService', ['showError']),
        },
        { provide: Platform, useValue: { is: () => false } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a title "Edit Profile"', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('ion-title')?.textContent).toContain(
      'Edit Profile'
    );
  });

  it('should report unsaved changes when form data diverges', () => {
    component.onFormChanges({
      ...component.userProfile(),
      displayName: 'Other',
    });
    expect(component.hasUnsavedChanges()).toBeTrue();
  });

  it('should navigate back without calling API when nothing changed', async () => {
    await component.onProfileUpdate({
      displayName: 'Jane',
      username: 'jane',
      bio: 'Hello',
      birthDate: '1990-01-01',
    });
    await fixture.whenStable();
    expect(navCtrlSpy.back).toHaveBeenCalled();
    expect(profileServiceSpy.updateProfile).not.toHaveBeenCalled();
  });

  it('should send avatarUrl null when user removes a remote avatar', async () => {
    component.onImageRemoved();
    expect(component.userProfile().profileImage).toBe(
      DEFAULT_PROFILE_IMAGE_PATH
    );

    profileServiceSpy.updateProfile.and.returnValue(
      of({ ...mockUser, avatarUrl: null })
    );

    await component.onProfileUpdate({
      displayName: 'Jane',
      username: 'jane',
      bio: 'Hello',
      birthDate: '1990-01-01',
    });
    await fixture.whenStable();

    expect(profileServiceSpy.updateProfile).toHaveBeenCalledWith(
      jasmine.objectContaining({ avatarUrl: null })
    );
  });

  it('should delegate profile update errors to facade', async () => {
    profileServiceSpy.updateProfile.and.returnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 409,
            error: { message: 'Username taken' },
          })
      )
    );

    await component.onProfileUpdate({
      displayName: 'Jane',
      username: 'newname',
      bio: 'Hello',
      birthDate: '1990-01-01',
    });
    await fixture.whenStable();

    expect(profileErrorFacadeSpy.handle).toHaveBeenCalled();
    expect(component.isLoading()).toBeFalse();
  });
});
