import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@features/auth/services/auth.service';
import { ProfileHeaderComponent } from '@features/profile/components/profile-header/profile-header.component';
import { ProfilePostGridComponent } from '@features/profile/components/profile-post-grid/profile-post-grid.component';
import { ProfileTabsComponent } from '@features/profile/components/profile-tabs/profile-tabs.component';
import { DEFAULT_PROFILE_IMAGE_PATH } from '@features/profile/constants/profile.constants';
import { NavController } from '@ionic/angular';
import {
  IonButtons,
  IonContent,
  IonMenuButton,
  IonSpinner,
} from '@ionic/angular/standalone';
import { TopBarComponent } from '@shared/components/top-bar/top-bar.component';
import { filterPostsByTab } from '../../utils/post-filter.utils';
import { MOCK_ALL_POSTS, MOCK_TAGGED_POSTS, MOCK_VIDEO_POSTS } from '../../data/profile.mock';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  imports: [
    TopBarComponent,
    IonButtons,
    IonMenuButton,
    IonSpinner,
    IonContent,
    ProfileHeaderComponent,
    ProfileTabsComponent,
    ProfilePostGridComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePage {
  private navCtrl = inject(NavController);
  private router = inject(Router);
  private authService = inject(AuthService);

  // State Signals
  selectedTab = signal<'All' | 'Videos' | 'Tags'>('All');
  isStoryAvailable = signal<boolean>(false);

  constructor() {
    if (!this.authService.currentUser()) {
      this.authService.fetchUserProfile();
    }
  }

  // Derived Data
  filteredPosts = computed(() => {
    return filterPostsByTab(
      this.selectedTab(),
      MOCK_ALL_POSTS,
      MOCK_VIDEO_POSTS,
      MOCK_TAGGED_POSTS
    );
  });

  // User Profile Data (from API only, no mock mixing)
  userProfile = computed(() => {
    const profile = this.authService.currentUser();
    if (!profile) return null;

    return {
      username: profile.username ?? '',
      name: profile.displayName ?? '',
      description: profile.bio ?? '',
      profileImage: profile.avatarUrl ?? DEFAULT_PROFILE_IMAGE_PATH,
      // Stats should come from API in the future
      postsCount: '0',
      videosCount: '0',
      followersCount: '0',
      followingCount: '0',
    };
  });

  goBack() {
    this.navCtrl.back();
  }

  goTo(screen: string) {
    this.router.navigateByUrl(screen);
  }

  onTabChange(tab: 'All' | 'Videos' | 'Tags') {
    this.selectedTab.set(tab);
  }
}
