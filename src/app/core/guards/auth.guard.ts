import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AUTH_STATE_TOKEN } from '../models/auth-state.interface';

/**
 * Guard to prevent unauthenticated access to private routes.
 * Uses canMatch to prevent lazy-loading the module if not authenticated.
 */
export const authGuard: CanMatchFn = (route, segments) => {
  const authState = inject(AUTH_STATE_TOKEN);
  const router = inject(Router);

  if (!authState.isAuthenticated()) {
    return router.createUrlTree(['/auth/sign-in']);
  }

  return true;
};
