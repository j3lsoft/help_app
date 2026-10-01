import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { of } from 'rxjs';
import { VerifyAccountPage } from './verify-account.page';
import { ErrorFacade } from '@core/errors/facades/error.facade';
import { AuthApiService } from '../../services/auth-api.service';
import { AuthService } from '../../services/auth.service';
import { AppStorageService } from 'src/app/core/services/storage/app-storage.service';

describe('VerifyAccountPage', () => {
  let component: VerifyAccountPage;
  let fixture: ComponentFixture<VerifyAccountPage>;
  let authApiMock: jasmine.SpyObj<AuthApiService>;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let storageMock: jasmine.SpyObj<AppStorageService>;
  let routerMock: jasmine.SpyObj<Router>;
  let errorFacadeMock: jasmine.SpyObj<ErrorFacade>;
  let routeMock: any;

  beforeEach(async () => {
    authApiMock = jasmine.createSpyObj('AuthApiService', [
      'verifyEmail',
      'resendVerification',
    ]);
    authServiceMock = jasmine.createSpyObj('AuthService', ['login']);
    storageMock = jasmine.createSpyObj('AppStorageService', [
      'getString',
      'remove',
    ]);
    routerMock = jasmine.createSpyObj('Router', ['navigateByUrl']);
    errorFacadeMock = jasmine.createSpyObj('ErrorFacade', [
      'handle',
      'getMessage',
    ]);
    routeMock = {
      snapshot: {
        queryParamMap: {
          get: (key: string) => (key === 'email' ? 'test@test.com' : null),
        },
      },
    };

    storageMock.getString.and.returnValue(Promise.resolve('test@test.com'));
    storageMock.remove.and.returnValue(Promise.resolve());

    await TestBed.configureTestingModule({
      imports: [VerifyAccountPage],
      providers: [
        { provide: AuthApiService, useValue: authApiMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: AppStorageService, useValue: storageMock },
        { provide: Router, useValue: routerMock },
        { provide: ErrorFacade, useValue: errorFacadeMock },
        { provide: ActivatedRoute, useValue: routeMock },
        {
          provide: NavController,
          useValue: jasmine.createSpyObj('NavController', ['back']),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VerifyAccountPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize email from route', () => {
    expect(component.email()).toBe('test@test.com');
  });

  it('should surface the error and not navigate when completing the session fails', async () => {
    authApiMock.verifyEmail.and.returnValue(
      of({ accessToken: 'token', accessTokenExpiresAt: '' })
    );
    authServiceMock.login.and.returnValue(
      Promise.reject(new Error('me failed'))
    );

    component.email.set('test@test.com');
    component.otpValue.set('123456');
    component.onContinue();

    await fixture.whenStable();

    expect(errorFacadeMock.handle).toHaveBeenCalled();
    expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
  });
});
