import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import { of, throwError } from 'rxjs';
import { AppStorageService } from 'src/app/core/services/storage/app-storage.service';
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
  let toastCtrlMock: jasmine.SpyObj<ToastController>;

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

    const toastSpy = jasmine.createSpyObj('HTMLIonToastElement', [
      'present',
      'onDidDismiss',
    ]);
    toastSpy.present.and.returnValue(Promise.resolve());
    toastSpy.onDidDismiss.and.returnValue(Promise.resolve());

    toastCtrlMock = jasmine.createSpyObj('ToastController', ['create']);
    toastCtrlMock.create.and.returnValue(Promise.resolve(toastSpy));

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
        { provide: ToastController, useValue: toastCtrlMock },
        {
          provide: NavController,
          useValue: jasmine.createSpyObj('NavController', ['back']),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPasswordPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should set error message on invalid change token (400)', async () => {
    const errorResponse = new HttpErrorResponse({ status: 400 });
    authApiMock.changePasswordWithToken.and.returnValue(
      throwError(() => errorResponse)
    );

    component.form.setValue({
      newPassword: 'Password123!',
      confirmPassword: 'Password123!',
    });

    component.onSubmit();
    await Promise.resolve();

    expect(component.errorMessage()).toBe('Invalid or expired change token.');
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
    await Promise.resolve();

    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/auth/sign-in', {
      replaceUrl: true,
    });
  });
});
