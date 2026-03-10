import { Routes } from '@angular/router';
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
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'bottom-tab-bar',
    loadComponent: () =>
      import('./screens/bottom-tab-bar/bottom-tab-bar.page').then(
        (m) => m.BottomTabBarPage
      ),
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('./screens/home/home.page').then((m) => m.HomePage),
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
    loadComponent: () =>
      import('./screens/search/search.page').then((m) => m.SearchPage),
  },
  {
    path: 'search-detail',
    loadComponent: () =>
      import('./screens/search-detail/search-detail.page').then(
        (m) => m.SearchDetailPage
      ),
  },
  {
    path: 'create-story',
    loadComponent: () =>
      import('./screens/create-story/create-story.page').then(
        (m) => m.CreateStoryPage
      ),
  },
  {
    path: 'story1',
    loadComponent: () =>
      import('./screens/story1/story1.page').then((m) => m.Story1Page),
  },
  {
    path: 'open-story',
    loadComponent: () =>
      import('./screens/open-story/open-story.page').then(
        (m) => m.OpenStoryPage
      ),
  },
  {
    path: 'user-profile',
    loadComponent: () =>
      import('./screens/user-profile/user-profile.page').then(
        (m) => m.UserProfilePage
      ),
  },
  {
    path: 'followers',
    loadComponent: () =>
      import('./screens/followers/followers.page').then((m) => m.FollowersPage),
  },
  {
    path: 'followings',
    loadComponent: () =>
      import('./screens/followings/followings.page').then(
        (m) => m.FollowingsPage
      ),
  },
  {
    path: 'user-posts',
    loadComponent: () =>
      import('./screens/user-posts/user-posts.page').then(
        (m) => m.UserPostsPage
      ),
  },
  {
    path: 'videos',
    loadComponent: () =>
      import('./screens/videos/videos.page').then((m) => m.VideosPage),
  },
  {
    path: 'comments',
    loadComponent: () =>
      import('./screens/comments/comments.page').then((m) => m.CommentsPage),
  },
  {
    path: 'follow-requests',
    loadComponent: () =>
      import('./screens/follow-requests/follow-requests.page').then(
        (m) => m.FollowRequestsPage
      ),
  },
  {
    path: 'post-filter/:imageUrl',
    loadComponent: () =>
      import('./screens/post-filter/post-filter.page').then(
        (m) => m.PostFilterPage
      ),
  },
  {
    path: 'post-caption-and-tag/:imageUrl',
    loadComponent: () =>
      import('./screens/post-caption-and-tag/post-caption-and-tag.page').then(
        (m) => m.PostCaptionAndTagPage
      ),
  },
  {
    path: 'chat',
    loadComponent: () =>
      import('./screens/chat/chat.page').then((m) => m.ChatPage),
  },
  {
    path: 'video-call',
    loadComponent: () =>
      import('./screens/video-call/video-call.page').then(
        (m) => m.VideoCallPage
      ),
  },
  {
    path: 'call',
    loadComponent: () =>
      import('./screens/call/call.page').then((m) => m.CallPage),
  },
  {
    path: 'search-chat',
    loadComponent: () =>
      import('./screens/search-chat/search-chat.page').then(
        (m) => m.SearchChatPage
      ),
  },
  {
    path: 'edit-profile',
    loadComponent: () =>
      import('./screens/edit-profile/edit-profile.page').then(
        (m) => m.EditProfilePage
      ),
  },
  {
    path: 'user-activity',
    loadComponent: () =>
      import('./screens/user-activity/user-activity.page').then(
        (m) => m.UserActivityPage
      ),
  },
  {
    path: 'account-privacy',
    loadComponent: () =>
      import('./screens/account-privacy/account-privacy.page').then(
        (m) => m.AccountPrivacyPage
      ),
  },
  {
    path: 'block-accounts',
    loadComponent: () =>
      import('./screens/block-accounts/block-accounts.page').then(
        (m) => m.BlockAccountsPage
      ),
  },
  {
    path: 'link-accounts',
    loadComponent: () =>
      import('./screens/link-accounts/link-accounts.page').then(
        (m) => m.LinkAccountsPage
      ),
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./screens/about/about.page').then((m) => m.AboutPage),
  },
  {
    path: 'help',
    loadComponent: () =>
      import('./screens/help/help.page').then((m) => m.HelpPage),
  },
  {
    path: 'help-detail/:title',
    loadComponent: () =>
      import('./screens/help-detail/help-detail.page').then(
        (m) => m.HelpDetailPage
      ),
  },
];
