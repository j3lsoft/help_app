import { TestBed } from '@angular/core/testing';
import { AppError } from '../models/app-error.model';
import { LoggerService } from '../services/logger.service';
import { NotificationService } from '../services/notification.service';
import { GlobalErrorHandler } from './global-error-handler';

describe('GlobalErrorHandler', () => {
  let handler: GlobalErrorHandler;
  let logger: jasmine.SpyObj<LoggerService>;
  let notifications: jasmine.SpyObj<NotificationService>;

  beforeEach(() => {
    logger = jasmine.createSpyObj('LoggerService', ['logError', 'error']);
    notifications = jasmine.createSpyObj('NotificationService', ['showError']);
    notifications.showError.and.resolveTo();

    TestBed.configureTestingModule({
      providers: [
        GlobalErrorHandler,
        { provide: LoggerService, useValue: logger },
        { provide: NotificationService, useValue: notifications },
      ],
    });

    handler = TestBed.inject(GlobalErrorHandler);
  });

  it('skips handled AppError instances', () => {
    const error: AppError = { status: 500, handled: true };
    handler.handleError(error);

    expect(logger.logError).not.toHaveBeenCalled();
    expect(notifications.showError).not.toHaveBeenCalled();
  });

  it('logs and notifies for generic errors', () => {
    handler.handleError(new Error('boom'));

    expect(logger.logError).toHaveBeenCalled();
    expect(notifications.showError).toHaveBeenCalled();
  });
});
