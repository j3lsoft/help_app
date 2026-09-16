import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, from, of, switchMap, throwError } from 'rxjs';
import { TokenRefreshService } from '../services/token-refresh.service';
import { AUTH_STATE_TOKEN, AuthState } from '../models/auth-state.interface';
import { LoggerService } from '../services/logger.service';

const SKIP_REFRESH_URLS = [
  '/api/v1/auth/refresh',
  '/api/v1/auth/login',
  '/api/v1/auth/logout',
];

function isAuthBypassUrl(url: string): boolean {
  return SKIP_REFRESH_URLS.some((path) => url.includes(path));
}

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authState = inject(AUTH_STATE_TOKEN);
  const tokenRefreshService = inject(TokenRefreshService);
  const logger = inject(LoggerService);

  return from(authState.getAccessToken()).pipe(
    switchMap((token) => {
      const isRefreshRequest = req.url.includes('/api/v1/auth/refresh');
      const authReq = req.clone({
        withCredentials: true,
        setHeaders:
          token && !isRefreshRequest
            ? { Authorization: `Bearer ${token}` }
            : undefined,
      });

      return next(authReq).pipe(
        catchError((error) => {
          if (
            error instanceof HttpErrorResponse &&
            error.status === 401 &&
            !isAuthBypassUrl(req.url)
          ) {
            logger.warn('401 detected', {
              context: 'AuthInterceptor',
              data: { url: req.url },
            });

            return handle401Error(
              authReq,
              next,
              authState,
              tokenRefreshService,
              logger
            );
          }
          return throwError(() => error);
        })
      );
    })
  );
};

const handle401Error = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authState: AuthState,
  tokenRefreshService: TokenRefreshService,
  logger: LoggerService
): Observable<HttpEvent<unknown>> => {
  logger.debug('Triggering session refresh', {
    context: 'AuthInterceptor',
  });

  return tokenRefreshService
    .refresh(() =>
      from(authState.refreshSession()).pipe(
        switchMap(() => from(authState.getAccessToken())),
        switchMap((newToken) =>
          newToken
            ? of(newToken)
            : throwError(() => new Error('Token refresh returned empty'))
        )
      )
    )
    .pipe(
      catchError((refreshError) => {
        logger.warn('Session refresh failed, logging out', {
          context: 'AuthInterceptor',
          data: { url: request.url },
        });

        return from(authState.logout()).pipe(
          switchMap(() => throwError(() => refreshError))
        );
      }),
      switchMap((newToken) => retryWithToken(request, next, newToken, authState))
    );
};

const retryWithToken = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
  token: string,
  authState: AuthState
): Observable<HttpEvent<unknown>> =>
  next(
    request.clone({
      withCredentials: true,
      setHeaders: { Authorization: `Bearer ${token}` },
    })
  ).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        return from(authState.logout()).pipe(
          switchMap(() => throwError(() => error))
        );
      }
      return throwError(() => error);
    })
  );
