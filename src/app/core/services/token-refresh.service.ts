import { Injectable } from '@angular/core';
import { Observable, defer, finalize, shareReplay } from 'rxjs';

/**
 * Coordinates token refreshes triggered by concurrent 401 responses.
 *
 * The first caller starts the refresh; every other caller shares the same
 * in-flight observable. The shared subscription is kept alive even if the
 * caller that started it unsubscribes, so the refresh always reaches a
 * terminal state and cannot strand later requests.
 */
@Injectable({
  providedIn: 'root',
})
export class TokenRefreshService {
  private inFlightRefresh$: Observable<string> | null = null;

  /**
   * Runs `factory` once while a refresh is in flight and shares the resulting
   * token with every concurrent caller.
   */
  refresh(factory: () => Observable<string>): Observable<string> {
    if (!this.inFlightRefresh$) {
      this.inFlightRefresh$ = defer(factory).pipe(
        finalize(() => {
          this.inFlightRefresh$ = null;
        }),
        shareReplay({ bufferSize: 1, refCount: false })
      );
    }

    return this.inFlightRefresh$;
  }
}
