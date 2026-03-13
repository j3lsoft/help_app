import { Routes } from '@angular/router';

export const SPLASH_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/splash.page').then((m) => m.SplashPage),
  },
];
