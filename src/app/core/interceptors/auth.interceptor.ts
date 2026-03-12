import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  catchError,
  filter,
  from,
  switchMap,
  take,
  throwError,
} from 'rxjs';
import { AuthService } from '../../features/auth/services/auth.service';

let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<
  string | null
>(null);

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);

  return from(authService.getAccessToken()).pipe(
    switchMap((token) => {
      let authReq = req;
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
            console.warn('[AuthInterceptor] 401 detected for', req.url);
            return handle401Error(authReq, next, authService);
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
  authService: AuthService
): Observable<HttpEvent<unknown>> => {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);
    console.log('[AuthInterceptor] Triggering session refresh...');

    return from(authService.refreshSession()).pipe(
      switchMap(() => from(authService.getAccessToken())),
      switchMap((newToken) => {
        isRefreshing = false;
        refreshTokenSubject.next(newToken);

        return next(
          request.clone({
            setHeaders: {
              Authorization: `Bearer ${newToken}`,
            },
          })
        );
      }),
      catchError((err) => {
        isRefreshing = false;
        refreshTokenSubject.error(err); // Error out all waiting requests
        refreshTokenSubject = new BehaviorSubject<string | null>(null);
        return from(authService.logout()).pipe(
          switchMap(() => throwError(() => err))
        );
      })
    );
  } else {
    return refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((token) => {
        return next(
          request.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`,
            },
          })
        );
      })
    );
  }
};
