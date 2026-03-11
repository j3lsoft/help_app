import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';

/**
 * Guard to prevent unauthenticated access to private routes.
 * Uses canMatch to prevent lazy-loading the module if not authenticated.
 */
export const authGuard: CanMatchFn = (route, segments) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/auth/sign-in']);
  }

  return true;
};
