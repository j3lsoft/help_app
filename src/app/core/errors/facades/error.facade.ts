import { Injectable, inject } from '@angular/core';
import { AppError } from '../../models/app-error.model';
import { NetworkService } from '../../services/network.service';
import { NotificationService } from '../../services/notification.service';
import { markHandled } from '../../utils/app-error.utils';
import { classifyTechnicalError } from '../../utils/error-handling.utils';
import { ErrorMapConfig } from '../error-map.interface';
import { mapError } from '../error-mapper';

/**
 * The slice of `ErrorFacade` a helper needs, so callers and tests can depend on
 * the `handle` contract without the whole service or Angular DI.
 */
export type ErrorMessageFacade = Pick<ErrorFacade, 'handle'>;

/**
 * Single module that turns an `AppError` into a user-facing message: technical
 * failures get a generic connection/rate-limit/server message, everything else
 * is resolved through the `ErrorMapConfig` the caller owns.
 */
@Injectable({ providedIn: 'root' })
export class ErrorFacade {
  private readonly notification = inject(NotificationService);
  private readonly network = inject(NetworkService);

  /** Shows the message and marks the error as handled. */
  handle(error: AppError, config: ErrorMapConfig): void {
    if (error.handled) return;

    void this.notification.showError(this.resolve(error, config));
    // Parity with the previous facade: the return value is dropped, so `handled`
    // is not set on the caller's object. Honouring it would change behaviour
    // (fewer re-notifications) and is out of scope for this refactor.
    markHandled(error);
  }

  /** Returns the message without notifying or marking the error. */
  getMessage(error: AppError, config: ErrorMapConfig): string {
    return this.resolve(error, config);
  }

  private resolve(error: AppError, config: ErrorMapConfig): string {
    const technicalMessage = classifyTechnicalError(error, {
      isOnline: this.network.isOnline(),
    });
    return technicalMessage ?? mapError(error, config);
  }
}
