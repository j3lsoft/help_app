import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { of, throwError } from 'rxjs';
import { AppError } from 'src/app/core/models/app-error.model';
import { NotificationService } from 'src/app/core/services/notification.service';
import { AppStorageService } from 'src/app/core/services/storage/app-storage.service';
import { AuthErrorFacade } from '../../errors/auth-error.facade';
import { AuthApiService } from '../../services/auth-api.service';
import { AuthService } from '../../services/auth.service';
import { ResetPasswordPage } from './reset-password.page';

describe('ResetPasswordPage', () => {
  let component: ResetPasswordPage;
  let fixture: ComponentFixture<ResetPasswordPage>;
  let authApiMock: jasmine.SpyObj<AuthApiService>;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let storageMock: jasmine.SpyObj<AppStorageService>;
  let routerMock: jasmine.SpyObj<Router>;
  let authErrorFacadeMock: jasmine.SpyObj<AuthErrorFacade>;

  beforeEach(async () => {
    authApiMock = jasmine.createSpyObj('AuthApiService', [
      'changePasswordWithToken',
    ]);
    authServiceMock = jasmine.createSpyObj('AuthService', ['logout']);
    storageMock = jasmine.createSpyObj('AppStorageService', [
      'getString',
      'remove',
      'setString',
    ]);
    routerMock = jasmine.createSpyObj('Router', ['navigateByUrl']);

    authErrorFacadeMock = jasmine.createSpyObj('AuthErrorFacade', [
      'handle',
      'getMessage',
    ]);

    const routeMock = {
      snapshot: {
        queryParamMap: {
          get: (key: string) => (key === 'email' ? 'test@test.com' : null),
        },
      },
    };

    storageMock.getString.and.callFake((key: string) => {
      if (key === 'PENDING_PASSWORD_RESET_EMAIL') {
        return Promise.resolve('test@test.com');
      }
      if (key === 'PENDING_CHANGE_PASSWORD_TOKEN') {
        return Promise.resolve('change-token');
      }
      return Promise.resolve(null);
    });

    await TestBed.configureTestingModule({
      imports: [ResetPasswordPage],
      providers: [
        { provide: AuthApiService, useValue: authApiMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: AppStorageService, useValue: storageMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: routeMock },
        {
          provide: NotificationService,
          useValue: jasmine.createSpyObj('NotificationService', [
            'showError',
            'showSuccess',
          ]),
        },
        { provide: AuthErrorFacade, useValue: authErrorFacadeMock },
        {
          provide: NavController,
          useValue: jasmine.createSpyObj('NavController', ['back']),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPasswordPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should delegate API errors to auth facade', async () => {
    const errorResponse: AppError = { status: 400, handled: false };
    authApiMock.changePasswordWithToken.and.returnValue(
      throwError(() => errorResponse)
    );

    component.form.setValue({
      newPassword: 'Password123!',
      confirmPassword: 'Password123!',
    });

    component.onSubmit();
    await Promise.resolve();

    expect(authErrorFacadeMock.handle).toHaveBeenCalledWith(
      errorResponse,
      'password-change'
    );
  });

  it('should not lock submission when token is missing', async () => {
    component.changePasswordToken.set(null);
    component.form.setValue({
      newPassword: 'Password123!',
      confirmPassword: 'Password123!',
    });

    component.onSubmit();
    await Promise.resolve();

    expect(component.isSubmitting()).toBeFalse();
  });

  it('should navigate to sign-in on success', async () => {
    authApiMock.changePasswordWithToken.and.returnValue(of(void 0));
    authServiceMock.logout.and.returnValue(Promise.resolve());
    storageMock.remove.and.returnValue(Promise.resolve());

    component.form.setValue({
      newPassword: 'Password123!',
      confirmPassword: 'Password123!',
    });

    component.onSubmit();
    await new Promise((r) => setTimeout(r, 0));
    await new Promise((r) => setTimeout(r, 0));

    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/auth/sign-in', {
      replaceUrl: true,
    });
  });
});
