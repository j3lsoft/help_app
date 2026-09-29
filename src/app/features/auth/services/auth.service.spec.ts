import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AppStorageService } from '@core/services/storage/app-storage.service';
import { SecureStorageService } from '@core/services/storage/secure-storage.service';
import { STORAGE_KEYS } from '@core/services/storage/storage-keys';
import { of, throwError } from 'rxjs';
import { AuthApiService } from './auth-api.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let storageMock: jasmine.SpyObj<AppStorageService>;
  let secureStorageMock: jasmine.SpyObj<SecureStorageService>;
  let authApiMock: jasmine.SpyObj<AuthApiService>;
  let routerMock: jasmine.SpyObj<Router>;

  beforeEach(() => {
    storageMock = jasmine.createSpyObj('AppStorageService', ['remove']);
    secureStorageMock = jasmine.createSpyObj('SecureStorageService', [
      'remove',
    ]);
    authApiMock = jasmine.createSpyObj('AuthApiService', ['logout']);
    routerMock = jasmine.createSpyObj('Router', ['navigateByUrl']);

    storageMock.remove.and.returnValue(Promise.resolve());
    secureStorageMock.remove.and.returnValue(Promise.resolve());
    routerMock.navigateByUrl.and.returnValue(Promise.resolve(true));
    authApiMock.logout.and.returnValue(of({ message: 'ok' }));

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: AppStorageService, useValue: storageMock },
        { provide: SecureStorageService, useValue: secureStorageMock },
        { provide: AuthApiService, useValue: authApiMock },
        { provide: Router, useValue: routerMock },
      ],
    });

    service = TestBed.inject(AuthService);
  });

  it('removes the pending change-password token from secure storage on logout', async () => {
    await service.logout();

    expect(secureStorageMock.remove).toHaveBeenCalledWith(
      STORAGE_KEYS.pendingChangePasswordToken
    );
  });

  it('purges any legacy plaintext copy of the pending change-password token on logout', async () => {
    await service.logout();

    expect(storageMock.remove).toHaveBeenCalledWith(
      STORAGE_KEYS.pendingChangePasswordToken
    );
  });

  it('removes the pending change-password token even when server logout fails', async () => {
    authApiMock.logout.and.returnValue(
      throwError(() => new Error('network error'))
    );

    await service.logout();

    expect(secureStorageMock.remove).toHaveBeenCalledWith(
      STORAGE_KEYS.pendingChangePasswordToken
    );
  });
});
