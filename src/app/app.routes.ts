import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { noAuthGuard } from './core/guards/no-auth.guard';
import { onboardingSeenGuard } from './core/guards/onboarding-seen.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'splash',
    pathMatch: 'full',
  },
  {
    path: 'splash',
    loadComponent: () =>
      import('./screens/splash/splash.page').then((m) => m.SplashPage),
  },
  {
    path: 'onboarding',
    canMatch: [onboardingSeenGuard],
    loadChildren: () =>
      import('./features/onboarding/onboarding.routes').then(
        (m) => m.ONBOARDING_ROUTES
      ),
  },
  {
    path: 'auth',
    canMatch: [noAuthGuard],
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'tabs',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./layout/tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      {
        path: 'home',
        loadChildren: () =>
          import('./features/home/home.routes').then((m) => m.HOME_ROUTES),
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./screens/notifications/notifications.page').then(
            (m) => m.NotificationsPage
          ),
      },
      {
        path: 'create-post',
        loadComponent: () =>
          import('./screens/create-post/create-post.page').then(
            (m) => m.CreatePostPage
          ),
      },
      {
        path: 'message',
        loadComponent: () =>
          import('./screens/message/message.page').then((m) => m.MessagePage),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./screens/profile/profile.page').then((m) => m.ProfilePage),
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'search',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./screens/search/search.page').then((m) => m.SearchPage),
  },
  {
    path: 'search-detail',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./screens/search-detail/search-detail.page').then(
        (m) => m.SearchDetailPage
      ),
  },
  {
    path: 'create-story',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./screens/create-story/create-story.page').then(
        (m) => m.CreateStoryPage
      ),
  },
  {
    path: 'story1',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./screens/story1/story1.page').then((m) => m.Story1Page),
  },
  {
    path: 'open-story',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./screens/open-story/open-story.page').then(
        (m) => m.OpenStoryPage
      ),
  },
  {
    path: 'user-profile',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./screens/user-profile/user-profile.page').then(
        (m) => m.UserProfilePage
      ),
  },
  {
    path: 'followers',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./screens/followers/followers.page').then((m) => m.FollowersPage),
  },
  {
    path: 'followings',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./screens/followings/followings.page').then(
        (m) => m.FollowingsPage
      ),
  },
  {
    path: 'user-posts',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./screens/user-posts/user-posts.page').then(
        (m) => m.UserPostsPage
      ),
  },
  {
    path: 'videos',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./screens/videos/videos.page').then((m) => m.VideosPage),
  },
  {
    path: 'comments',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./screens/comments/comments.page').then((m) => m.CommentsPage),
  },
  {
    path: 'follow-requests',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./screens/follow-requests/follow-requests.page').then(
        (m) => m.FollowRequestsPage
      ),
  },
  {
    path: 'post-filter/:imageUrl',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./screens/post-filter/post-filter.page').then(
        (m) => m.PostFilterPage
      ),
  },
  {
    path: 'post-caption-and-tag/:imageUrl',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./screens/post-caption-and-tag/post-caption-and-tag.page').then(
        (m) => m.PostCaptionAndTagPage
      ),
  },
  {
    path: 'chat',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./screens/chat/chat.page').then((m) => m.ChatPage),
  },
  {
    path: 'video-call',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./screens/video-call/video-call.page').then(
        (m) => m.VideoCallPage
      ),
  },
  {
    path: 'call',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./screens/call/call.page').then((m) => m.CallPage),
  },
  {
    path: 'search-chat',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./screens/search-chat/search-chat.page').then(
        (m) => m.SearchChatPage
      ),
  },
  {
    path: 'edit-profile',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./screens/edit-profile/edit-profile.page').then(
        (m) => m.EditProfilePage
      ),
  },
  {
    path: 'user-activity',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./screens/user-activity/user-activity.page').then(
        (m) => m.UserActivityPage
      ),
  },
  {
    path: 'account-privacy',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./screens/account-privacy/account-privacy.page').then(
        (m) => m.AccountPrivacyPage
      ),
  },
  {
    path: 'block-accounts',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./screens/block-accounts/block-accounts.page').then(
        (m) => m.BlockAccountsPage
      ),
  },
  {
    path: 'link-accounts',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./screens/link-accounts/link-accounts.page').then(
        (m) => m.LinkAccountsPage
      ),
  },
  {
    path: 'about',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./screens/about/about.page').then((m) => m.AboutPage),
  },
  {
    path: 'help',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./screens/help/help.page').then((m) => m.HelpPage),
  },
  {
    path: 'help-detail/:title',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./screens/help-detail/help-detail.page').then(
        (m) => m.HelpDetailPage
      ),
  },
];
