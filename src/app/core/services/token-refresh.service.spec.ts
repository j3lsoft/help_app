import { TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import { TokenRefreshService } from './token-refresh.service';

describe('TokenRefreshService', () => {
  let service: TokenRefreshService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TokenRefreshService);
  });

  it('shares a single refresh between concurrent callers', () => {
    const subject = new Subject<string>();
    let factoryCalls = 0;
    const factory = () => {
      factoryCalls++;
      return subject.asObservable();
    };

    const results: string[] = [];
    service.refresh(factory).subscribe((token) => results.push(token));
    service.refresh(factory).subscribe((token) => results.push(token));

    expect(factoryCalls).toBe(1);

    subject.next('new-token');
    subject.complete();

    expect(results).toEqual(['new-token', 'new-token']);
  });

  it('starts a new refresh after the previous one completes', () => {
    let factoryCalls = 0;
    const factory = () => {
      factoryCalls++;
      return of('token');
    };

    service.refresh(factory).subscribe();
    service.refresh(factory).subscribe();

    expect(factoryCalls).toBe(2);
  });

  it('keeps the refresh alive when the initiating subscriber unsubscribes', () => {
    const subject = new Subject<string>();
    let factoryCalls = 0;
    const factory = () => {
      factoryCalls++;
      return subject.asObservable();
    };

    const subscription = service.refresh(factory).subscribe();
    subscription.unsubscribe();

    const results: string[] = [];
    service.refresh(factory).subscribe((token) => results.push(token));

    expect(factoryCalls).toBe(1);

    subject.next('token');
    subject.complete();

    expect(results).toEqual(['token']);
  });

  it('replays a failed refresh to concurrent callers', () => {
    const subject = new Subject<string>();
    const error = new Error('refresh failed');
    let factoryCalls = 0;
    const factory = () => {
      factoryCalls++;
      return subject.asObservable();
    };

    const errors: unknown[] = [];
    service.refresh(factory).subscribe({ error: (e) => errors.push(e) });
    service.refresh(factory).subscribe({ error: (e) => errors.push(e) });

    expect(factoryCalls).toBe(1);

    subject.error(error);

    expect(errors).toEqual([error, error]);
  });

  it('allows a new refresh after a failure', () => {
    let factoryCalls = 0;
    const factory = () => {
      factoryCalls++;
      return throwError(() => new Error('boom'));
    };

    service.refresh(factory).subscribe({ error: () => undefined });
    service.refresh(factory).subscribe({ error: () => undefined });

    expect(factoryCalls).toBe(2);
  });
});
