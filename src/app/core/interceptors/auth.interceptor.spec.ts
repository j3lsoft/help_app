import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AuthService } from '../../features/auth/services/auth.service';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', [
      'getAccessToken',
      'refreshSession',
    ]);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceSpy },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should add an Authorization header when token is present', fakeAsync(() => {
    authServiceSpy.getAccessToken.and.returnValue(
      Promise.resolve('fake-token')
    );

    httpClient.get('/test').subscribe();
    tick(); // Wait for getAccessToken promise

    const req = httpMock.expectOne('/test');
    expect(req.request.headers.has('Authorization')).toBeTrue();
    expect(req.request.headers.get('Authorization')).toBe('Bearer fake-token');
    req.flush({});
  }));

  it('should not add an Authorization header when token is absent', fakeAsync(() => {
    authServiceSpy.getAccessToken.and.returnValue(Promise.resolve(null));

    httpClient.get('/test').subscribe();
    tick();

    const req = httpMock.expectOne('/test');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  }));

  it('should handle 401 and refresh the session', fakeAsync(() => {
    authServiceSpy.getAccessToken.and.returnValues(
      Promise.resolve('expired-token'), // First call for initial request
      Promise.resolve('new-token') // Second call after refresh
    );
    authServiceSpy.refreshSession.and.returnValue(Promise.resolve());

    let responseData: any;
    httpClient.get('/api/data').subscribe((res) => (responseData = res));

    tick(); // Initial token retrieval

    const initialReq = httpMock.expectOne('/api/data');
    expect(initialReq.request.headers.get('Authorization')).toBe(
      'Bearer expired-token'
    );

    initialReq.flush('Unauthorized', {
      status: 401,
      statusText: 'Unauthorized',
    });
    tick(); // refreshSession promise + next token retrieval

    expect(authServiceSpy.refreshSession).toHaveBeenCalled();

    const retryReq = httpMock.expectOne('/api/data');
    expect(retryReq.request.headers.get('Authorization')).toBe(
      'Bearer new-token'
    );
    retryReq.flush({ success: true });

    tick();
    expect(responseData).toEqual({ success: true });
  }));

  it('should only call refresh once for concurrent 401s', fakeAsync(() => {
    authServiceSpy.getAccessToken.and.returnValues(
      Promise.resolve('expired-token'), // Req 1 initial
      Promise.resolve('expired-token'), // Req 2 initial
      Promise.resolve('new-token'), // After refresh
      Promise.resolve('new-token') // After refresh for second req
    );

    let resolveRefresh: any;
    authServiceSpy.refreshSession.and.returnValue(
      new Promise((resolve) => (resolveRefresh = resolve))
    );

    let completed = 0;
    httpClient.get('/api/one').subscribe(() => completed++);
    httpClient.get('/api/two').subscribe(() => completed++);

    tick(); // Both requests get initial tokens

    const req1 = httpMock.expectOne('/api/one');
    const req2 = httpMock.expectOne('/api/two');

    req1.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    req2.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    tick(); // Triggers refreshSession (but it's still pending)
    expect(authServiceSpy.refreshSession).toHaveBeenCalledTimes(1);

    resolveRefresh();
    tick(); // Refresh resolves, triggers token retrieval and retries

    const retry1 = httpMock.expectOne('/api/one');
    const retry2 = httpMock.expectOne('/api/two');
    expect(retry1.request.headers.get('Authorization')).toBe(
      'Bearer new-token'
    );
    expect(retry2.request.headers.get('Authorization')).toBe(
      'Bearer new-token'
    );

    retry1.flush({});
    retry2.flush({});
    tick();

    expect(completed).toBe(2);
  }));
});
