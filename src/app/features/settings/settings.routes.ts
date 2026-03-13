import { Routes } from '@angular/router';

export const SETTINGS_ROUTES: Routes = [
  {
    path: 'security',
    loadComponent: () =>
      import('./pages/security/security.page').then((m) => m.SecurityPage),
  },
  {
    path: 'change-password',
    loadComponent: () =>
      import('./pages/change-password/change-password.page').then(
        (m) => m.ChangePasswordPage
      ),
  },
];
