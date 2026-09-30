import {
  HttpClient,
  HttpInterceptorFn,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { throwError } from 'rxjs';
import { errorInterceptor } from './error.interceptor';
import { AppError } from '../models/app-error.model';
import { LoggerService } from '../services/logger.service';
import { NetworkService } from '../services/network.service';
import { NotificationService } from '../services/notification.service';

describe('errorInterceptor', () => {
  let notification: jasmine.SpyObj<NotificationService>;
  let network: jasmine.SpyObj<NetworkService>;
  let logger: jasmine.SpyObj<LoggerService>;

  beforeEach(() => {
    notification = jasmine.createSpyObj('NotificationService', ['showError']);
    notification.showError.and.resolveTo();

    network = jasmine.createSpyObj('NetworkService', ['isOnline']);
    network.isOnline.and.returnValue(true);

    logger = jasmine.createSpyObj('LoggerService', [
      'debug',
      'warn',
      'error',
      'info',
    ]);
  });

  function configure(extra: HttpInterceptorFn[] = []) {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor, ...extra])),
        provideHttpClientTesting(),
        { provide: NotificationService, useValue: notification },
        { provide: NetworkService, useValue: network },
        { provide: LoggerService, useValue: logger },
      ],
    });

    return {
      http: TestBed.inject(HttpClient),
      httpMock: TestBed.inject(HttpTestingController),
    };
  }

  it('shows a global toast and marks a technical error as handled', (done) => {
    const { http, httpMock } = configure();

    http.post('/api/v1/auth/login', {}).subscribe({
      error: (error: AppError) => {
        expect(error.status).toBe(500);
        expect(error.handled).toBeTrue();
        expect(notification.showError).toHaveBeenCalledTimes(1);
        done();
      },
    });

    httpMock
      .expectOne('/api/v1/auth/login')
      .flush({}, { status: 500, statusText: 'Server Error' });
  });

  it('does not re-adapt nor toast an error already marked as handled', (done) => {
    const handled: AppError = {
      status: 500,
      handled: true,
      message: 'already shown',
    };
    const { http } = configure([() => throwError(() => handled)]);

    http.get('/api/v1/posts').subscribe({
      error: (error: AppError) => {
        expect(error).toBe(handled);
        expect(notification.showError).not.toHaveBeenCalled();
        done();
      },
    });
  });
});
