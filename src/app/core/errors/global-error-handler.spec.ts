import { TestBed } from '@angular/core/testing';
import { AppError } from '../models/app-error.model';
import { LoggerService } from '../services/logger.service';
import { NetworkService } from '../services/network.service';
import { NotificationService } from '../services/notification.service';
import { ErrorFacade } from './facades/error.facade';
import { GlobalErrorHandler } from './global-error-handler';

describe('GlobalErrorHandler', () => {
  let handler: GlobalErrorHandler;
  let logger: jasmine.SpyObj<LoggerService>;
  let notifications: jasmine.SpyObj<NotificationService>;
  let network: jasmine.SpyObj<NetworkService>;

  beforeEach(() => {
    logger = jasmine.createSpyObj('LoggerService', ['logError', 'error']);
    notifications = jasmine.createSpyObj('NotificationService', ['showError']);
    notifications.showError.and.resolveTo();
    network = jasmine.createSpyObj('NetworkService', ['isOnline']);
    network.isOnline.and.returnValue(true);

    TestBed.configureTestingModule({
      providers: [
        GlobalErrorHandler,
        ErrorFacade,
        { provide: LoggerService, useValue: logger },
        { provide: NotificationService, useValue: notifications },
        { provide: NetworkService, useValue: network },
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

  it('does not notify again when a facade already handled the error', () => {
    const facade = TestBed.inject(ErrorFacade);
    const error: AppError = { status: 500, handled: false };

    facade.handle(error, { fallback: 'Fallback error' });
    expect(error.handled).toBeTrue();
    expect(notifications.showError).toHaveBeenCalledTimes(1);

    handler.handleError(error);

    expect(logger.logError).not.toHaveBeenCalled();
    expect(notifications.showError).toHaveBeenCalledTimes(1);
  });
});
