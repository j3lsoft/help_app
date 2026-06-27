import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { rxResource, toObservable } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { toAppError } from '@core/utils/app-error.utils';
import { catchSocialError, followActionContext } from '../../utils/social-page-error.utils';
import {
  IonContent,
  IonSpinner,
  IonText,
  NavController,
} from '@ionic/angular/standalone';
import { BackHeaderComponent } from '@shared/components/back-header/back-header.component';
import { ProfileHeaderComponent } from '@features/profile/components/profile-header/profile-header.component';
import { ProfilePostGridComponent } from '@features/profile/components/profile-post-grid/profile-post-grid.component';
import { ProfileTabsComponent } from '@features/profile/components/profile-tabs/profile-tabs.component';
import { FollowButtonComponent } from '@shared/components/follow-button/follow-button.component';
import { addIcons } from 'ionicons';
import { chevronBack, playOutline } from 'ionicons/icons';
import { catchError, finalize, map, of, switchMap } from 'rxjs';
import {
  MOCK_ALL_POSTS,
  MOCK_TAGGED_POSTS,
  MOCK_VIDEO_POSTS,
} from '../../data/profile.mock';
import { ProfileErrorFacade } from '../../errors/profile-error.facade';
import { SocialErrorFacade } from '../../errors/social-error.facade';
import { ProfileService } from '../../services/profile.service';
import { FollowService } from '../../services/follow.service';
import { filterPostsByTab, TabValue } from '../../utils/post-filter.utils';
import { normalizeWebsiteUrl, stripWebsiteProtocol } from '../../utils/website-url.utils';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.page.html',
  styleUrls: ['./user-profile.page.scss'],
  imports: [
    IonContent,
    IonText,
    IonSpinner,
    BackHeaderComponent,
    ProfileHeaderComponent,
    ProfilePostGridComponent,
    ProfileTabsComponent,
    FollowButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserProfilePage {
  private readonly navCtrl = inject(NavController);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly profileService = inject(ProfileService);
  private readonly profileErrorFacade = inject(ProfileErrorFacade);
  private readonly socialErrorFacade = inject(SocialErrorFacade);
  private readonly followService = inject(FollowService);

  selectedTabValue = signal<TabValue>('All');

  readonly userProfile = rxResource({
    stream: () =>
      this.route.paramMap.pipe(
        map((params) => params.get('username') || ''),
        switchMap((username: string) => {
          if (!username) {
            return of(null);
          }
          return this.profileService.getPublicProfile(username).pipe(
            catchError((error: unknown) => {
              this.profileErrorFacade.handle(toAppError(error), 'profile');
              return of(null);
            })
          );
        })
      ),
  });

  private readonly profileId = computed(
    () => this.userProfile.value()?.id ?? null
  );

  private readonly profileId$ = toObservable(this.profileId);

  private readonly profileIsFollowing = computed(
    () => this.userProfile.value()?.relationship?.isFollowing ?? false
  );

  readonly isFollowing = linkedSignal({
    source: this.profileIsFollowing,
    computation: (following) => following,
  });

  readonly followCounts = rxResource({
    stream: () =>
      this.profileId$.pipe(
        switchMap((userId) => {
          if (!userId) {
            return of(null);
          }
          return this.followService.getFollowCounts(userId).pipe(
            catchError((error: unknown) => {
              this.socialErrorFacade.handle(toAppError(error), 'follow-counts');
              return of(null);
            })
          );
        })
      ),
  });

  readonly followerCount = computed(
    () => this.followCounts.value()?.followerCount ?? 0
  );

  readonly followingCount = computed(
    () => this.followCounts.value()?.followeeCount ?? 0
  );

  private readonly _isTogglingFollow = signal(false);
  readonly isTogglingFollow = this._isTogglingFollow.asReadonly();

  fullWebsiteUrl = computed(() =>
    normalizeWebsiteUrl(this.userProfile.value()?.website)
  );

  stripWebsite = (url: string | null | undefined): string =>
    stripWebsiteProtocol(url);

  filteredPosts = computed(() => {
    return filterPostsByTab(
      this.selectedTabValue(),
      MOCK_ALL_POSTS,
      MOCK_VIDEO_POSTS,
      MOCK_TAGGED_POSTS
    );
  });

  constructor() {
    addIcons({ chevronBack, playOutline });
  }

  goBack() {
    this.navCtrl.back();
  }

  goTo(screen: string) {
    this.router.navigateByUrl(screen);
  }

  goToFollowers() {
    const profile = this.userProfile.value();
    if (profile) {
      this.router.navigateByUrl(`followers/${profile.id}`);
    }
  }

  goToFollowings() {
    const profile = this.userProfile.value();
    if (profile) {
      this.router.navigateByUrl(`followings/${profile.id}`);
    }
  }

  onTabChange(tab: TabValue) {
    this.selectedTabValue.set(tab);
  }

  toggleFollow() {
    const profile = this.userProfile.value();
    if (!profile || this._isTogglingFollow()) return;

    const prev = this.isFollowing();
    this._isTogglingFollow.set(true);
    this.isFollowing.set(!prev);

    this.followService
      .toggleFollow(profile.id, prev)
      .pipe(
        catchSocialError(
          this.socialErrorFacade,
          followActionContext(prev),
          () => this.isFollowing.set(prev)
        ),
        finalize(() => this._isTogglingFollow.set(false))
      )
      .subscribe();
  }
}
