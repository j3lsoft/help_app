import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { authInterceptor } from './auth.interceptor';
import { AUTH_STATE_TOKEN, AuthState } from '../models/auth-state.interface';
import { LoggerService } from '../services/logger.service';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let currentToken: string;
  let resolveRefresh: () => void;
  let rejectRefresh: (error: unknown) => void;
  let authState: jasmine.SpyObj<AuthState>;

  beforeEach(() => {
    currentToken = 'old-token';
    let resolve!: () => void;
    let reject!: (error: unknown) => void;
    const refreshPromise = new Promise<void>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    resolveRefresh = resolve;
    rejectRefresh = reject;

    authState = jasmine.createSpyObj<AuthState>('AuthState', [
      'isAuthenticated',
      'getAccessToken',
      'restoreSession',
      'refreshSession',
      'logout',
    ]);
    authState.getAccessToken.and.callFake(async () => currentToken);
    authState.refreshSession.and.callFake(async () => {
      await refreshPromise;
      currentToken = 'new-token';
    });
    authState.logout.and.resolveTo();

    const logger = jasmine.createSpyObj('LoggerService', [
      'debug',
      'warn',
      'error',
      'info',
    ]);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AUTH_STATE_TOKEN, useValue: authState },
        { provide: LoggerService, useValue: logger },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('refreshes on 401 and retries with the new token', fakeAsync(() => {
    let result: unknown;
    http.get('/api/v1/users/me').subscribe((response) => (result = response));
    flushMicrotasks();

    const first = httpMock.expectOne('/api/v1/users/me');
    expect(first.request.headers.get('Authorization')).toBe('Bearer old-token');
    first.flush({}, { status: 401, statusText: 'Unauthorized' });
    flushMicrotasks();

    expect(authState.refreshSession).toHaveBeenCalledTimes(1);

    resolveRefresh();
    flushMicrotasks();

    const retry = httpMock.expectOne('/api/v1/users/me');
    expect(retry.request.headers.get('Authorization')).toBe(
      'Bearer new-token'
    );
    retry.flush({ ok: true });

    expect(result).toEqual({ ok: true });
  }));

  it('shares a single refresh across concurrent 401s', fakeAsync(() => {
    http.get('/api/v1/users/me').subscribe();
    http.get('/api/v1/posts').subscribe();
    flushMicrotasks();

    const me = httpMock.expectOne('/api/v1/users/me');
    const posts = httpMock.expectOne('/api/v1/posts');
    me.flush({}, { status: 401, statusText: 'Unauthorized' });
    posts.flush({}, { status: 401, statusText: 'Unauthorized' });
    flushMicrotasks();

    expect(authState.refreshSession).toHaveBeenCalledTimes(1);

    resolveRefresh();
    flushMicrotasks();

    const meRetry = httpMock.expectOne('/api/v1/users/me');
    const postsRetry = httpMock.expectOne('/api/v1/posts');
    expect(meRetry.request.headers.get('Authorization')).toBe(
      'Bearer new-token'
    );
    expect(postsRetry.request.headers.get('Authorization')).toBe(
      'Bearer new-token'
    );
    meRetry.flush({});
    postsRetry.flush({});
  }));

  it('logs out when the refresh fails', fakeAsync(() => {
    http.get('/api/v1/users/me').subscribe({ error: () => undefined });
    flushMicrotasks();

    const request = httpMock.expectOne('/api/v1/users/me');
    request.flush({}, { status: 401, statusText: 'Unauthorized' });
    flushMicrotasks();

    rejectRefresh(new Error('refresh failed'));
    flushMicrotasks();

    expect(authState.logout).toHaveBeenCalledTimes(1);
  }));

  it('does not refresh on non-401 errors', fakeAsync(() => {
    http.get('/api/v1/users/me').subscribe({ error: () => undefined });
    flushMicrotasks();

    const request = httpMock.expectOne('/api/v1/users/me');
    request.flush({}, { status: 500, statusText: 'Server Error' });
    flushMicrotasks();

    expect(authState.refreshSession).not.toHaveBeenCalled();
    expect(authState.logout).not.toHaveBeenCalled();
  }));

  it('does not refresh requests to auth bypass urls', fakeAsync(() => {
    http.post('/api/v1/auth/logout', {}).subscribe({ error: () => undefined });
    flushMicrotasks();

    const request = httpMock.expectOne('/api/v1/auth/logout');
    request.flush({}, { status: 401, statusText: 'Unauthorized' });
    flushMicrotasks();

    expect(authState.refreshSession).not.toHaveBeenCalled();
  }));
});
