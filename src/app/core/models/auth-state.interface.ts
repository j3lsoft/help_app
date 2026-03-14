import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * Interface representing the authentication state.
 * This abstraction allows core services to depend on auth state
 * without directly importing from feature modules.
 */
export interface AuthState {
  /**
   * Returns true if the user is currently authenticated.
   */
  isAuthenticated(): boolean;

  /**
   * Gets the current access token.
   * @returns Promise resolving to the token or null if not authenticated.
   */
  getAccessToken(): Promise<string | null>;

  /**
   * Restores the authentication session from storage.
   * @returns Promise that resolves when restoration is complete.
   */
  restoreSession(): Promise<void>;

  /**
   * Refreshes the current session.
   * @returns Promise that resolves when refresh is complete.
   */
  refreshSession(): Promise<void>;

  /**
   * Logs out the current user and clears session data.
   * @returns Promise that resolves when logout is complete.
   */
  logout(): Promise<void>;
}

/**
 * Injection token for AuthState.
 * Use this token to inject auth state without depending on concrete implementation.
 */
export const AUTH_STATE_TOKEN = new InjectionToken<AuthState>('AUTH_STATE');
