import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'splash',
    pathMatch: 'full'
  },
  {
    path: 'splash',
    loadChildren: () => import('./screens/splash/splash.module').then( m => m.SplashPageModule)
  },
  {
    path: 'onboarding',
    loadChildren: () => import('./screens/onboarding/onboarding.module').then( m => m.OnboardingPageModule)
  },
  {
    path: 'auth',
    loadChildren: () => import('./screens/auth/auth.module').then( m => m.AuthPageModule)
  },
  {
    path: 'bottom-tab-bar',
    loadChildren: () => import('./screens/bottom-tab-bar/bottom-tab-bar.module').then( m => m.BottomTabBarPageModule)
  },
  {
    path: 'search',
    loadChildren: () => import('./screens/search/search.module').then( m => m.SearchPageModule)
  },
  {
    path: 'search-detail',
    loadChildren: () => import('./screens/search-detail/search-detail.module').then( m => m.SearchDetailPageModule)
  },
  {
    path: 'create-story',
    loadChildren: () => import('./screens/create-story/create-story.module').then( m => m.CreateStoryPageModule)
  },
  {
    path: 'story1',
    loadChildren: () => import('./screens/story1/story1.module').then( m => m.Story1PageModule)
  },
  {
    path: 'open-story',
    loadChildren: () => import('./screens/open-story/open-story.module').then( m => m.OpenStoryPageModule)
  },
  {
    path: 'user-profile',
    loadChildren: () => import('./screens/user-profile/user-profile.module').then( m => m.UserProfilePageModule)
  },
  {
    path: 'followers',
    loadChildren: () => import('./screens/followers/followers.module').then( m => m.FollowersPageModule)
  },
  {
    path: 'followings',
    loadChildren: () => import('./screens/followings/followings.module').then( m => m.FollowingsPageModule)
  },
  {
    path: 'user-posts',
    loadChildren: () => import('./screens/user-posts/user-posts.module').then( m => m.UserPostsPageModule)
  },
  {
    path: 'videos',
    loadChildren: () => import('./screens/videos/videos.module').then( m => m.VideosPageModule)
  },
  {
    path: 'comments',
    loadChildren: () => import('./screens/comments/comments.module').then( m => m.CommentsPageModule)
  },
  {
    path: 'follow-requests',
    loadChildren: () => import('./screens/follow-requests/follow-requests.module').then( m => m.FollowRequestsPageModule)
  },
  {
    path: 'post-filter/:imageUrl',
    loadChildren: () => import('./screens/post-filter/post-filter.module').then( m => m.PostFilterPageModule)
  },
  {
    path: 'post-caption-and-tag/:imageUrl',
    loadChildren: () => import('./screens/post-caption-and-tag/post-caption-and-tag.module').then( m => m.PostCaptionAndTagPageModule)
  },
  {
    path: 'chat',
    loadChildren: () => import('./screens/chat/chat.module').then( m => m.ChatPageModule)
  },
  {
    path: 'video-call',
    loadChildren: () => import('./screens/video-call/video-call.module').then( m => m.VideoCallPageModule)
  },
  {
    path: 'call',
    loadChildren: () => import('./screens/call/call.module').then( m => m.CallPageModule)
  },
  {
    path: 'search-chat',
    loadChildren: () => import('./screens/search-chat/search-chat.module').then( m => m.SearchChatPageModule)
  },
  {
    path: 'edit-profile',
    loadChildren: () => import('./screens/edit-profile/edit-profile.module').then( m => m.EditProfilePageModule)
  },
  {
    path: 'user-activity',
    loadChildren: () => import('./screens/user-activity/user-activity.module').then( m => m.UserActivityPageModule)
  },
  {
    path: 'account-privacy',
    loadChildren: () => import('./screens/account-privacy/account-privacy.module').then( m => m.AccountPrivacyPageModule)
  },
  {
    path: 'block-accounts',
    loadChildren: () => import('./screens/block-accounts/block-accounts.module').then( m => m.BlockAccountsPageModule)
  },
  {
    path: 'link-accounts',
    loadChildren: () => import('./screens/link-accounts/link-accounts.module').then( m => m.LinkAccountsPageModule)
  },
  {
    path: 'about',
    loadChildren: () => import('./screens/about/about.module').then( m => m.AboutPageModule)
  },
  {
    path: 'help',
    loadChildren: () => import('./screens/help/help.module').then( m => m.HelpPageModule)
  },
  {
    path: 'help-detail/:title',
    loadChildren: () => import('./screens/help-detail/help-detail.module').then( m => m.HelpDetailPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
