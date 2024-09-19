import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BottomTabBarPage } from './bottom-tab-bar.page';

const routes: Routes = [
  {
    path: '',
    component: BottomTabBarPage,
    children:[
      {
        path: 'home',
        loadChildren: () => import('../../screens/home/home.module').then( m => m.HomePageModule)
      },
      {
        path: 'notifications',
        loadChildren: () => import('../../screens/notifications/notifications.module').then( m => m.NotificationsPageModule)
      },
      {
        path: 'create-post',
        loadChildren: () => import('../../screens/create-post/create-post.module').then( m => m.CreatePostPageModule)
      },
      {
        path: 'message',
        loadChildren: () => import('../../screens/message/message.module').then( m => m.MessagePageModule)
      },
      {
        path: 'profile',
        loadChildren: () => import('../../screens/profile/profile.module').then( m => m.ProfilePageModule)
      },
      {
        path: '',
        redirectTo:'home',
        pathMatch: 'full',
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BottomTabBarPageRoutingModule {}
