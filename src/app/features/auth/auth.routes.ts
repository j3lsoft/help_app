import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/shell/auth-shell.page').then((m) => m.AuthShellPage),
    children: [
      {
        path: '',
        redirectTo: 'sign-in',
        pathMatch: 'full',
      },
      {
        path: 'sign-in',
        loadComponent: () =>
          import('./pages/login/login.page').then((m) => m.LoginPage),
      },
      {
        path: 'sign-up',
        loadComponent: () =>
          import('./pages/register/register.page').then((m) => m.RegisterPage),
      },
      {
        path: 'verification',
        loadComponent: () =>
          import('./pages/verify-account/verify-account.page').then(
            (m) => m.VerifyAccountPage,
          ),
      },
    ],
  },
];
