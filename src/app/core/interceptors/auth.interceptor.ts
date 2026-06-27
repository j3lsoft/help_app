import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, from, switchMap, throwError } from 'rxjs';
import { TokenRefreshService } from '../services/token-refresh.service';
import { AUTH_STATE_TOKEN } from '../models/auth-state.interface';
import { LoggerService } from '../services/logger.service';

const SKIP_REFRESH_URLS = ['/api/v1/auth/refresh', '/api/v1/auth/login'];

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
  authState: import('../models/auth-state.interface').AuthState,
  tokenRefreshService: TokenRefreshService,
  logger: LoggerService
): Observable<HttpEvent<unknown>> => {
  if (!tokenRefreshService.refreshing) {
    tokenRefreshService.startRefresh();

    logger.debug('Triggering session refresh', {
      context: 'AuthInterceptor',
    });

    return from(authState.refreshSession()).pipe(
      switchMap(() => from(authState.getAccessToken())),
      switchMap((newToken) => {
        tokenRefreshService.completeRefresh(newToken ?? '');

        return next(
          request.clone({
            withCredentials: true,
            setHeaders: {
              Authorization: `Bearer ${newToken}`,
            },
          })
        );
      }),
      catchError((err) => {
        tokenRefreshService.failRefresh(err);
        return from(authState.logout()).pipe(
          switchMap(() => throwError(() => err))
        );
      })
    );
  } else {
    return tokenRefreshService.waitForRefresh().pipe(
      switchMap((token) => {
        return next(
          request.clone({
            withCredentials: true,
            setHeaders: {
              Authorization: `Bearer ${token}`,
            },
          })
        );
      })
    );
  }
};
