import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  computed,
  effect,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { rxResource, toObservable } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { LoggerService } from '@core/services/logger.service';
import { toAppError } from '@core/utils/app-error.utils';
import {
  catchSocialError,
  followActionContext,
} from '../../utils/social-page-error.utils';
import {
  IonContent,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonRefresher,
  IonRefresherContent,
  IonText,
  NavController,
} from '@ionic/angular/standalone';
import { BackHeaderComponent } from '@shared/components/back-header/back-header.component';
import { ProfileHeaderComponent } from '@features/profile/components/profile-header/profile-header.component';
import { ProfilePostGridComponent } from '@features/profile/components/profile-post-grid/profile-post-grid.component';
import { FollowButtonComponent } from '@shared/components/follow-button/follow-button.component';
import { addIcons } from 'ionicons';
import { chevronBack, playOutline } from 'ionicons/icons';
import { catchError, finalize, map, of, switchMap } from 'rxjs';
import { ProfileErrorFacade } from '../../errors/profile-error.facade';
import { SocialErrorFacade } from '../../errors/social-error.facade';
import { ProfileService } from '../../services/profile.service';
import { FollowService } from '../../services/follow.service';
import { PostsApiService } from '@features/posts/services/posts-api.service';
import { createProfilePostsLoader } from '../../utils/profile-posts.loader';
import {
  normalizeWebsiteUrl,
  stripWebsiteProtocol,
} from '../../utils/website-url.utils';
import { PostItem } from '../../models/post-item.model';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.page.html',
  styleUrls: ['./user-profile.page.scss'],
  imports: [
    IonContent,
    IonText,
    IonRefresher,
    IonRefresherContent,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    BackHeaderComponent,
    ProfileHeaderComponent,
    ProfilePostGridComponent,
    FollowButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserProfilePage implements OnDestroy {
  private readonly navCtrl = inject(NavController);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly logger = inject(LoggerService);
  private readonly profileService = inject(ProfileService);
  private readonly profileErrorFacade = inject(ProfileErrorFacade);
  private readonly socialErrorFacade = inject(SocialErrorFacade);
  private readonly followService = inject(FollowService);
  private readonly postsApi = inject(PostsApiService);

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
            }),
          );
        }),
      ),
  });

  private readonly profileId = computed(
    () => this.userProfile.value()?.id ?? null,
  );

  private readonly profileId$ = toObservable(this.profileId);

  private readonly profileIsFollowing = computed(
    () => this.userProfile.value()?.relationship?.isFollowing ?? false,
  );

  readonly followsYou = computed(
    () => this.userProfile.value()?.relationship?.followsYou ?? false
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
          return this.followService.getSocialState(userId).pipe(
            catchError((error: unknown) => {
              this.socialErrorFacade.handle(toAppError(error), 'follow-counts');
              return of(null);
            }),
          );
        }),
      ),
  });

  private readonly _followerDelta = signal(0);

  readonly followerCount = computed(
    () => (this.followCounts.value()?.followerCount ?? 0) + this._followerDelta(),
  );

  readonly followingCount = computed(
    () => this.followCounts.value()?.followeeCount ?? 0,
  );

  private readonly postsLoader = createProfilePostsLoader({
    fetchPage: (userId, cursor) => this.postsApi.getUserPosts(userId, { cursor }),
    logger: this.logger,
  });

  readonly profilePosts = this.postsLoader.posts;
  readonly isLoadingPosts = this.postsLoader.isLoading;
  readonly hasMorePosts = this.postsLoader.hasMore;
  readonly postsNotFound = this.postsLoader.notFound;
  readonly postsCount = this.postsLoader.postsCount;

  private readonly _isTogglingFollow = signal(false);
  readonly isTogglingFollow = this._isTogglingFollow.asReadonly();

  fullWebsiteUrl = computed(() =>
    normalizeWebsiteUrl(this.userProfile.value()?.website),
  );

  stripWebsite = (url: string | null | undefined): string =>
    stripWebsiteProtocol(url);

  constructor() {
    addIcons({ chevronBack, playOutline });

    effect(() => {
      const userId = this.profileId();
      if (userId) {
        this.postsLoader.loadFirst(userId);
      }
    });
  }

  loadMorePosts(event: CustomEvent): void {
    const userId = this.profileId();
    if (!userId) {
      (event.target as unknown as { complete: () => void }).complete();
      return;
    }
    this.postsLoader.loadMore(userId, () =>
      (event.target as unknown as { complete: () => void }).complete(),
    );
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

  handleRefresh(event: CustomEvent) {
    this.userProfile.reload();
    this.followCounts.reload();
    const userId = this.profileId();
    if (userId) {
      this.postsLoader.loadFirst(userId);
    }
    setTimeout(
      () => (event.target as unknown as { complete: () => void }).complete(),
      600,
    );
  }

  ngOnDestroy() {
    this.postsLoader.destroy();
  }

  onPostClick(post: PostItem) {
    if (post.id) {
      this.router.navigateByUrl(`post-detail/${post.id}`);
    }
  }

  toggleFollow() {
    const profile = this.userProfile.value();
    if (!profile || this._isTogglingFollow()) return;

    const prev = this.isFollowing();
    this._isTogglingFollow.set(true);
    this.isFollowing.set(!prev);
    this._followerDelta.update((d) => d + (prev ? -1 : 1));

    this.followService
      .toggleFollow(profile.id, prev)
      .pipe(
        catchSocialError(
          this.socialErrorFacade,
          followActionContext(prev),
          () => {
            this.isFollowing.set(prev);
            this._followerDelta.update((d) => d + (prev ? 1 : -1));
          },
        ),
        finalize(() => this._isTogglingFollow.set(false)),
      )
      .subscribe();
  }
}