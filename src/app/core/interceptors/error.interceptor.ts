import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, retry, throwError, timer } from 'rxjs';
import { HttpErrorAdapter } from '../adapters/http-error.adapter';
import { LoggerService } from '../services/logger.service';
import { NetworkService } from '../services/network.service';
import { NotificationService } from '../services/notification.service';
import { markHandled } from '../utils/app-error.utils';
import { classifyTechnicalError } from '../utils/error-handling.utils';
import { getHttpErrorLogLevel, isTechnicalError } from '../utils/http.utils';

export const errorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const notificationService = inject(NotificationService);
  const logger = inject(LoggerService);
  const network = inject(NetworkService);

  return next(req).pipe(
    retry({
      count: 2,
      delay: (error: HttpErrorResponse, retryCount: number) => {
        if (req.method !== 'GET' || !isTechnicalError(error.status)) {
          return throwError(() => error);
        }
        return timer(retryCount * 1000);
      },
    }),
    catchError((error: HttpErrorResponse) => {
      const appError = HttpErrorAdapter.adapt(error);
      const logLevel = getHttpErrorLogLevel(appError.status);
      const isOnline = network.isOnline();
      const isOffline = appError.status === 0 && !isOnline;

      if (logLevel !== 'ignore') {
        const logData = {
          url: req.url,
          method: req.method,
          status: appError.status,
          code: appError.code,
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

      const technicalMessage = classifyTechnicalError(appError, { isOnline });
      if (technicalMessage) {
        // Only show global toasts for technical errors (not business/validation).
        void notificationService.showError(technicalMessage);
        markHandled(appError);
      }

      return throwError(() => appError);
    })
  );
};
