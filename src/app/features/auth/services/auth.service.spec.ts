import { TestBed, fakeAsync, flushMicrotasks, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AppStorageService } from '@core/services/storage/app-storage.service';
import { SecureStorageService } from '@core/services/storage/secure-storage.service';
import { STORAGE_KEYS } from '@core/services/storage/storage-keys';
import { LoggerService } from '@core/services/logger.service';
import { NEVER, of, throwError } from 'rxjs';
import {
  AuthUserDto,
  LoginResponseDto,
  LoginUserResponseDto,
  MeResponseDto,
} from '../models/auth.dto';
import { AuthApiService } from './auth-api.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let storageMock: jasmine.SpyObj<AppStorageService>;
  let secureStorageMock: jasmine.SpyObj<SecureStorageService>;
  let authApiMock: jasmine.SpyObj<AuthApiService>;
  let routerMock: jasmine.SpyObj<Router>;
  let loggerMock: jasmine.SpyObj<LoggerService>;

  beforeEach(() => {
    storageMock = jasmine.createSpyObj('AppStorageService', [
      'remove',
      'setString',
    ]);
    secureStorageMock = jasmine.createSpyObj('SecureStorageService', [
      'remove',
      'set',
    ]);
    authApiMock = jasmine.createSpyObj('AuthApiService', ['logout', 'getMe']);
    routerMock = jasmine.createSpyObj('Router', ['navigateByUrl']);
    loggerMock = jasmine.createSpyObj('LoggerService', [
      'debug',
      'warn',
      'error',
      'info',
    ]);

    storageMock.remove.and.returnValue(Promise.resolve());
    storageMock.setString.and.returnValue(Promise.resolve());
    secureStorageMock.remove.and.returnValue(Promise.resolve());
    secureStorageMock.set.and.returnValue(Promise.resolve());
    routerMock.navigateByUrl.and.returnValue(Promise.resolve(true));
    authApiMock.logout.and.returnValue(of({ message: 'ok' }));

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: AppStorageService, useValue: storageMock },
        { provide: SecureStorageService, useValue: secureStorageMock },
        { provide: AuthApiService, useValue: authApiMock },
        { provide: Router, useValue: routerMock },
        { provide: LoggerService, useValue: loggerMock },
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

  it('completes the local logout when session revocation hangs', fakeAsync(() => {
    authApiMock.logout.and.returnValue(NEVER);

    let resolved = false;
    void service.logout().then(() => (resolved = true));

    tick(3000);
    flushMicrotasks();

    expect(resolved).toBeTrue();
    expect(secureStorageMock.remove).toHaveBeenCalledWith(
      STORAGE_KEYS.accessToken
    );
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/auth/sign-in', {
      replaceUrl: true,
    });
    expect(loggerMock.warn).toHaveBeenCalled();
  }));

  const loginUser: LoginUserResponseDto = {
    id: 'u1',
    email: 'test@test.com',
    avatarUrl: null,
    emailVerified: true,
    username: 'test',
    displayName: 'Test',
  };

  const authUser: AuthUserDto = {
    id: 'u1',
    email: 'test@test.com',
    emailVerified: true,
    username: 'test',
    displayName: 'Test',
    avatarUrl: null,
  };

  const meResponse: MeResponseDto = {
    ...authUser,
    birthDate: null,
    bio: null,
    website: null,
  };

  const loginResponse = (
    user?: LoginUserResponseDto
  ): LoginResponseDto => ({
    accessToken: 'fresh-token',
    accessTokenExpiresAt: '2099-01-01T00:00:00.000Z',
    user,
  });

  it('persists the user from the login response without calling /me', async () => {
    await service.login(loginResponse(loginUser));

    expect(secureStorageMock.set).toHaveBeenCalledWith(
      STORAGE_KEYS.accessToken,
      'fresh-token'
    );
    expect(storageMock.setString).toHaveBeenCalledWith(
      STORAGE_KEYS.userData,
      JSON.stringify(authUser)
    );
    expect(service.currentUser()).toEqual(authUser);
    expect(authApiMock.getMe).not.toHaveBeenCalled();
  });

  it('completes the session from /me when the login response omits the user', async () => {
    authApiMock.getMe.and.returnValue(of(meResponse));

    await service.login(loginResponse(undefined));

    expect(authApiMock.getMe).toHaveBeenCalledTimes(1);
    expect(storageMock.setString).toHaveBeenCalledWith(
      STORAGE_KEYS.userData,
      JSON.stringify(authUser)
    );
    expect(service.currentUser()).toEqual(authUser);
  });

  it('rolls back the half-session and rejects when /me fails', async () => {
    authApiMock.getMe.and.returnValue(throwError(() => new Error('me failed')));

    await expectAsync(service.login(loginResponse(undefined))).toBeRejected();

    expect(secureStorageMock.remove).toHaveBeenCalledWith(
      STORAGE_KEYS.accessToken
    );
    expect(storageMock.remove).toHaveBeenCalledWith(STORAGE_KEYS.userData);
    expect(service.currentUser()).toBeNull();
  });
});
