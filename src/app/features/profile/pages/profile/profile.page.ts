import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { toAppError } from '@core/utils/app-error.utils';
import { catchSocialError } from '../../utils/social-page-error.utils';
import { toProfileHeaderViewModel } from '../../utils/profile-view.utils';
import { AuthService } from '@features/auth/services/auth.service';
import { ProfileHeaderComponent } from '@features/profile/components/profile-header/profile-header.component';
import { ProfilePostGridComponent } from '@features/profile/components/profile-post-grid/profile-post-grid.component';
import { ProfileTabsComponent } from '@features/profile/components/profile-tabs/profile-tabs.component';
import { ProfileErrorFacade } from '../../errors/profile-error.facade';
import { ProfileService } from '@features/profile/services/profile.service';
import { FollowService } from '@features/profile/services/follow.service';
import { catchError, throwError } from 'rxjs';
import {
  IonButtons,
  IonContent,
  IonMenuButton,
  IonSpinner,
  IonText,
  NavController,
  ViewWillEnter,
} from '@ionic/angular/standalone';
import { TopBarComponent } from '@shared/components/top-bar/top-bar.component';
import {
  MOCK_ALL_POSTS,
  MOCK_TAGGED_POSTS,
  MOCK_VIDEO_POSTS,
} from '../../data/profile.mock';
import { filterPostsByTab, TabValue } from '../../utils/post-filter.utils';
import { SocialErrorFacade } from '../../errors/social-error.facade';

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
    IonText,
    ProfileHeaderComponent,
    ProfileTabsComponent,
    ProfilePostGridComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePage implements ViewWillEnter {
  private navCtrl = inject(NavController);
  private router = inject(Router);
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);
  private followService = inject(FollowService);
  private readonly profileErrorFacade = inject(ProfileErrorFacade);
  private readonly socialErrorFacade = inject(SocialErrorFacade);

  selectedTab = signal<TabValue>('All');
  isStoryAvailable = signal<boolean>(false);

  private readonly profileResource = rxResource({
    stream: () =>
      this.profileService.getMyProfile().pipe(
        catchError((error: unknown) => {
          const appError = toAppError(error);
          this.profileErrorFacade.handle(appError, 'profile');
          return throwError(() => appError);
        })
      ),
  });

  isLoadingProfile = computed(() => this.profileResource.isLoading());

  showProfileError = computed(() => !!this.profileResource.error());

  userProfile = computed(() => {
    const authUser = this.authService.currentUser();
    const fullProfile = this.profileService.currentProfile();

    if (!authUser) return null;

    return toProfileHeaderViewModel({
      source: fullProfile ?? authUser,
      fullProfile,
      followerCount: this.followService.followerCount(),
      followingCount: this.followService.followingCount(),
    });
  });

  ionViewWillEnter() {
    const userId = this.authService.currentUser()?.id;
    if (!userId) return;

    this.followService
      .loadFollowCounts(userId)
      .pipe(catchSocialError(this.socialErrorFacade, 'follow-counts'))
      .subscribe();
  }

  filteredPosts = computed(() => {
    return filterPostsByTab(
      this.selectedTab(),
      MOCK_ALL_POSTS,
      MOCK_VIDEO_POSTS,
      MOCK_TAGGED_POSTS
    );
  });

  goBack() {
    this.navCtrl.back();
  }

  goTo(screen: string) {
    this.router.navigateByUrl(screen);
  }

  goToFollowers() {
    const userId = this.authService.currentUser()?.id;
    if (userId) {
      this.router.navigateByUrl(`followers/${userId}`);
    }
  }

  goToFollowings() {
    const userId = this.authService.currentUser()?.id;
    if (userId) {
      this.router.navigateByUrl(`followings/${userId}`);
    }
  }

  onTabChange(tab: TabValue) {
    this.selectedTab.set(tab);
  }
}
