import { Routes } from '@angular/router';

export const PROFILE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/profile/profile.page').then((m) => m.ProfilePage),
  },
  {
    path: 'edit-profile',
    loadComponent: () =>
      import('./pages/edit-profile/edit-profile.page').then(
        (m) => m.EditProfilePage
      ),
  },
  {
    path: 'user-profile/:id',
    loadComponent: () =>
      import('./pages/user-profile/user-profile.page').then(
        (m) => m.UserProfilePage
      ),
  },
];
