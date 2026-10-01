import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { AppStorageService } from '@core/services/storage/app-storage.service';
import { SecureStorageService } from '@core/services/storage/secure-storage.service';
import { STORAGE_KEYS } from '@core/services/storage/storage-keys';
import { NavController } from '@ionic/angular';
import { of } from 'rxjs';
import { ErrorFacade } from '@core/errors/facades/error.facade';
import { AuthApiService } from '../../services/auth-api.service';
import { VerifyResetOtpPage } from './verify-reset-otp.page';

describe('VerifyResetOtpPage', () => {
  let component: VerifyResetOtpPage;
  let fixture: ComponentFixture<VerifyResetOtpPage>;
  let authApiMock: jasmine.SpyObj<AuthApiService>;
  let storageMock: jasmine.SpyObj<AppStorageService>;
  let secureStorageMock: jasmine.SpyObj<SecureStorageService>;
  let routerMock: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authApiMock = jasmine.createSpyObj('AuthApiService', [
      'verifyPasswordResetOtp',
      'requestPasswordReset',
    ]);
    storageMock = jasmine.createSpyObj('AppStorageService', [
      'getString',
      'setString',
      'remove',
    ]);
    secureStorageMock = jasmine.createSpyObj('SecureStorageService', [
      'get',
      'set',
      'remove',
    ]);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    storageMock.getString.and.returnValue(Promise.resolve('test@test.com'));
    storageMock.setString.and.returnValue(Promise.resolve());
    secureStorageMock.set.and.returnValue(Promise.resolve());
    routerMock.navigate.and.returnValue(Promise.resolve(true));

    const routeMock = {
      snapshot: {
        queryParamMap: {
          get: (key: string) => (key === 'email' ? 'test@test.com' : null),
        },
      },
    };

    await TestBed.configureTestingModule({
      imports: [VerifyResetOtpPage],
      providers: [
        { provide: AuthApiService, useValue: authApiMock },
        { provide: AppStorageService, useValue: storageMock },
        { provide: SecureStorageService, useValue: secureStorageMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: routeMock },
        {
          provide: ErrorFacade,
          useValue: jasmine.createSpyObj('ErrorFacade', ['handle']),
        },
        {
          provide: NavController,
          useValue: jasmine.createSpyObj('NavController', ['back']),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VerifyResetOtpPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('stores the change-password token in secure storage after OTP verification', async () => {
    authApiMock.verifyPasswordResetOtp.and.returnValue(
      of({ changePasswordToken: 'change-token-123' })
    );

    component.onChange('123456');
    await new Promise((r) => setTimeout(r, 0));

    expect(secureStorageMock.set).toHaveBeenCalledWith(
      STORAGE_KEYS.pendingChangePasswordToken,
      'change-token-123'
    );
    expect(storageMock.setString).not.toHaveBeenCalledWith(
      STORAGE_KEYS.pendingChangePasswordToken,
      jasmine.anything()
    );
    expect(storageMock.remove).toHaveBeenCalledWith(
      STORAGE_KEYS.pendingChangePasswordToken
    );
  });
});
