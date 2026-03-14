import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AUTH_STATE_TOKEN } from '../models/auth-state.interface';

/**
 * Guard to prevent authenticated users from accessing public/auth pages.
 * Redirects to home if already logged in.
 */
export const noAuthGuard: CanMatchFn = (route, segments) => {
  const authState = inject(AUTH_STATE_TOKEN);
  const router = inject(Router);

  if (authState.isAuthenticated()) {
    return router.createUrlTree(['/tabs/home']);
  }

  return true;
};
