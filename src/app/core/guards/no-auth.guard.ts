import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';

/**
 * Guard to prevent authenticated users from accessing public/auth pages.
 * Redirects to home if already logged in.
 */
export const noAuthGuard: CanMatchFn = (route, segments) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return router.createUrlTree(['/tabs/home']);
  }

  return true;
};
