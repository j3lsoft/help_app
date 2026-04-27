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
import { ProfileService } from '@features/profile/services/profile.service';
import {
  IonButtons,
  IonContent,
  IonMenuButton,
  IonSpinner,
  NavController,
} from '@ionic/angular/standalone';
import { TopBarComponent } from '@shared/components/top-bar/top-bar.component';
import { firstValueFrom } from 'rxjs';
import {
  MOCK_ALL_POSTS,
  MOCK_TAGGED_POSTS,
  MOCK_VIDEO_POSTS,
} from '../../data/profile.mock';
import { filterPostsByTab } from '../../utils/post-filter.utils';
import { stripWebsiteProtocol } from '../../utils/website-url.utils';

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
  private profileService = inject(ProfileService);

  // State Signals
  selectedTab = signal<'All' | 'Videos' | 'Tags'>('All');
  isStoryAvailable = signal<boolean>(false);
  isLoadingProfile = signal<boolean>(false);

  constructor() {
    // Stale-while-revalidate: fetch profile in background
    // If cached, display immediately. Always refresh.
    this.loadProfile();
  }

  private async loadProfile(): Promise<void> {
    this.isLoadingProfile.set(true);
    try {
      await firstValueFrom(this.profileService.getMyProfile());
    } finally {
      this.isLoadingProfile.set(false);
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

  // User Profile Data
  // Uses cached profile (with bio/website) if available, falls back to auth user
  userProfile = computed(() => {
    const authUser = this.authService.currentUser();
    const fullProfile = this.profileService.currentProfile();

    // No auth user at all
    if (!authUser) return null;

    // Use full profile if available (has bio/website), otherwise auth user
    const source = fullProfile ?? authUser;

    return {
      username: source.username ?? '',
      name: source.displayName ?? '',
      // bio and website only from full profile
      description: fullProfile?.bio ?? '',
      website: stripWebsiteProtocol(fullProfile?.website ?? ''),
      profileImage: source.avatarUrl ?? DEFAULT_PROFILE_IMAGE_PATH,
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
