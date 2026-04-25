import { inject } from '@angular/core';
import { AppError } from '../../models/app-error.model';
import { markHandled } from '../../utils/app-error.utils';
import { NotificationService } from '../../services/notification.service';
import { NetworkService } from '../../services/network.service';
import { classifyTechnicalError } from '../../utils/error-handling.utils';

export abstract class BaseErrorFacade<TContext> {
  protected readonly notification = inject(NotificationService);
  protected readonly network = inject(NetworkService);

  protected handleBase(
    error: AppError,
    context: TContext,
    mapFn: (error: AppError, context: TContext) => string
  ): void {
    if (error.handled) return;

    const technicalMessage = classifyTechnicalError(error, {
      isOnline: this.network.isOnline(),
    });
    if (technicalMessage) {
      void this.notification.showError(technicalMessage);
      markHandled(error);
      return;
    }

    const businessMessage = mapFn(error, context);
    void this.notification.showError(businessMessage);
    markHandled(error);
  }

  protected getMessageBase(
    error: AppError,
    context: TContext,
    mapFn: (error: AppError, context: TContext) => string
  ): string {
    const technicalMessage = classifyTechnicalError(error, {
      isOnline: this.network.isOnline(),
    });
    if (technicalMessage) {
      return technicalMessage;
    }

    return mapFn(error, context);
  }
}
