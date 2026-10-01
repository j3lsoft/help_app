import { TestBed } from '@angular/core/testing';
import { AppError } from '../../models/app-error.model';
import { NetworkService } from '../../services/network.service';
import { NotificationService } from '../../services/notification.service';
import { ErrorMapConfig } from '../error-map.interface';
import { ErrorFacade } from './error.facade';

describe('ErrorFacade', () => {
  let facade: ErrorFacade;
  let notificationSpy: jasmine.SpyObj<NotificationService>;
  let networkSpy: jasmine.SpyObj<NetworkService>;

  const config: ErrorMapConfig = {
    byCode: { CONFLICT: 'Conflict by code' },
    byStatus: { 404: 'Not found by status' },
    fallback: 'Fallback error',
  };

  function appError(overrides: Partial<AppError> = {}): AppError {
    return { status: 418, handled: false, ...overrides };
  }

  beforeEach(() => {
    notificationSpy = jasmine.createSpyObj('NotificationService', ['showError']);
    notificationSpy.showError.and.resolveTo();
    networkSpy = jasmine.createSpyObj('NetworkService', ['isOnline']);
    networkSpy.isOnline.and.returnValue(true);

    TestBed.configureTestingModule({
      providers: [
        ErrorFacade,
        { provide: NotificationService, useValue: notificationSpy },
        { provide: NetworkService, useValue: networkSpy },
      ],
    });
    facade = TestBed.inject(ErrorFacade);
  });

  it('shows the technical message for a network error', () => {
    facade.handle(appError({ status: 0 }), config);

    expect(notificationSpy.showError).toHaveBeenCalledWith(
      'Network error. Please check your connection.',
    );
  });

  it('shows the technical message for a rate limit', () => {
    facade.handle(appError({ status: 429 }), config);

    expect(notificationSpy.showError).toHaveBeenCalledWith(
      'Too many requests. Please try again later.',
    );
  });

  it('shows the technical message for a server error', () => {
    facade.handle(appError({ status: 500 }), config);

    expect(notificationSpy.showError).toHaveBeenCalledWith(
      'Server error. Please try again later.',
    );
  });

  it('maps a business error by code', () => {
    facade.handle(appError({ status: 404, code: 'CONFLICT' }), config);

    expect(notificationSpy.showError).toHaveBeenCalledWith('Conflict by code');
  });

  it('maps a business error by status', () => {
    facade.handle(appError({ status: 404 }), config);

    expect(notificationSpy.showError).toHaveBeenCalledWith(
      'Not found by status',
    );
  });

  it('falls back when nothing matches', () => {
    facade.handle(appError({ status: 418 }), config);

    expect(notificationSpy.showError).toHaveBeenCalledWith('Fallback error');
  });

  it('does nothing when the error is already handled', () => {
    facade.handle(appError({ status: 500, handled: true }), config);

    expect(notificationSpy.showError).not.toHaveBeenCalled();
  });

  it('getMessage returns the mapped message without toasting', () => {
    expect(facade.getMessage(appError({ status: 404 }), config)).toBe(
      'Not found by status',
    );
    expect(notificationSpy.showError).not.toHaveBeenCalled();
  });

  it('getMessage returns the technical message for a technical error', () => {
    expect(facade.getMessage(appError({ status: 503 }), config)).toBe(
      'Server error. Please try again later.',
    );
  });

  it('getMessage works even when the error is already handled', () => {
    expect(
      facade.getMessage(appError({ status: 404, handled: true }), config),
    ).toBe('Not found by status');
  });
});
