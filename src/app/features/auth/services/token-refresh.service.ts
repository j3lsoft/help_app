import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, filter, take } from 'rxjs';

/**
 * Service to manage the token refresh state.
 * Centralizes the refresh logic to avoid race conditions when multiple
 * requests trigger a 401 response simultaneously.
 */
@Injectable({
  providedIn: 'root',
})
export class TokenRefreshService {
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  /**
   * Checks if a token refresh is currently in progress.
   */
  get refreshing(): boolean {
    return this.isRefreshing;
  }

  /**
   * Starts a new refresh operation.
   * Should be called before initiating the refresh request.
   */
  startRefresh(): void {
    this.isRefreshing = true;
    this.refreshTokenSubject.next(null);
  }

  /**
   * Completes the refresh operation with the new token.
   * @param token The new access token
   */
  completeRefresh(token: string): void {
    this.isRefreshing = false;
    this.refreshTokenSubject.next(token);
  }

  /**
   * Signals that the refresh operation failed.
   * Resets the state and notifies waiting requests.
   * @param error The error that occurred
   */
  failRefresh(error: Error): void {
    this.isRefreshing = false;
    this.refreshTokenSubject.error(error);
    // Reset the subject for future refresh attempts
    this.refreshTokenSubject = new BehaviorSubject<string | null>(null);
  }

  /**
   * Gets an observable that emits when the refresh completes successfully.
   * Use this to wait for an ongoing refresh operation.
   */
  waitForRefresh(): Observable<string> {
    return this.refreshTokenSubject.pipe(
      filter((token): token is string => token !== null),
      take(1)
    );
  }
}
