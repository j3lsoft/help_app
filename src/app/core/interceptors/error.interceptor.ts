import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, retry, throwError, timer } from 'rxjs';
import { ErrorHandlerService } from '../services/error-handler.service';
import { LoggerService } from '../services/logger.service';
import { NotificationService } from '../services/notification.service';
import {
  getHttpErrorLogLevel,
  HTTP_STATUS,
  isRateLimitError,
  isTechnicalError,
} from '../utils/http.utils';

export const errorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const notificationService = inject(NotificationService);
  const errorHandler = inject(ErrorHandlerService);
  const logger = inject(LoggerService);

  return next(req).pipe(
    retry({
      count: 2,
      delay: (error: HttpErrorResponse, retryCount: number) => {
        if (isTechnicalError(error.status)) {
          return timer(retryCount * 1000);
        }
        return throwError(() => error);
      },
    }),
    catchError((error: HttpErrorResponse) => {
      const logLevel = getHttpErrorLogLevel(error.status);
      const isNetworkError = error.status === HTTP_STATUS.NETWORK_ERROR;
      const isOffline = isNetworkError && !navigator.onLine;

      if (logLevel !== 'ignore') {
        const logData = {
          url: req.url,
          method: req.method,
          status: error.status,
          offline: isOffline,
        };

        if (logLevel === 'error') {
          logger.error('HTTP Error', {
            context: 'ErrorInterceptor',
            data: logData,
          });
        } else if (logLevel === 'warn') {
          logger.warn('HTTP Warning', {
            context: 'ErrorInterceptor',
            data: logData,
          });
        }
      }

      if (shouldShowNotification(error)) {
        const errorMessage = isOffline
          ? 'No internet connection. Please check your network and try again.'
          : errorHandler.mapError(error);
        notificationService.showError(errorMessage);
      }

      return throwError(() => error);
    })
  );
};

function shouldShowNotification(error: HttpErrorResponse): boolean {
  return (
    error.status === HTTP_STATUS.NETWORK_ERROR ||
    error.status >= HTTP_STATUS.INTERNAL_SERVER_ERROR ||
    isRateLimitError(error.status)
  );
}
