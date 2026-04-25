import { Routes } from '@angular/router';

export const MESSAGE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/message/message.page').then((m) => m.MessagePage),
  },
];
