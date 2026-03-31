import { ErrorHandler, Injectable, inject } from '@angular/core';
import { LoggerService } from '../services/logger.service';
import { NotificationService } from '../services/notification.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly logger = inject(LoggerService);
  private readonly notificationService = inject(NotificationService);

  handleError(error: unknown): void {
    if (error instanceof Error) {
      this.logger.logError(error, { context: 'GlobalErrorHandler' });
    } else {
      this.logger.error('Unhandled Error', {
        context: 'GlobalErrorHandler',
        data: { error: String(error) },
      });
    }

    this.notificationService.showError(
      'An unexpected error occurred. Please try again.'
    );
  }
}
