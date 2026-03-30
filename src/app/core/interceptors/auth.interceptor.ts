import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, from, switchMap, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TokenRefreshService } from '../../features/auth/services/token-refresh.service';
import { AUTH_STATE_TOKEN } from '../models/auth-state.interface';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authState = inject(AUTH_STATE_TOKEN);
  const tokenRefreshService = inject(TokenRefreshService);

  return from(authState.getAccessToken()).pipe(
    switchMap((token) => {
      let authReq = req.clone({
        withCredentials: true,
      });

      if (token && !req.url.includes('/api/v1/auth/refresh')) {
        authReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      return next(authReq).pipe(
        catchError((error) => {
          if (
            error instanceof HttpErrorResponse &&
            error.status === 401 &&
            !req.url.includes('/api/v1/auth/refresh')
          ) {
            if (!environment.production) {
              console.warn('[AuthInterceptor] 401 detected for', req.url);
            }
            return handle401Error(
              authReq,
              next,
              authState,
              tokenRefreshService
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
  tokenRefreshService: TokenRefreshService
): Observable<HttpEvent<unknown>> => {
  if (!tokenRefreshService.refreshing) {
    tokenRefreshService.startRefresh();
    if (!environment.production) {
      console.log('[AuthInterceptor] Triggering session refresh...');
    }

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
