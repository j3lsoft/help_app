import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { AppError } from '@core/models/app-error.model';
import { LoggerService } from '@core/services/logger.service';
import { isAppError, toAppError } from '@core/utils/app-error.utils';
import {
  catchSocialError,
  followActionContext,
} from '../../utils/social-page-error.utils';
import {
  IonButton,
  IonContent,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonRefresher,
  IonRefresherContent,
  IonText,
  NavController,
  ViewWillEnter,
} from '@ionic/angular/standalone';
import { BackHeaderComponent } from '@shared/components/back-header/back-header.component';
import { FollowButtonComponent } from '@shared/components/follow-button/follow-button.component';
import { ImageLightboxComponent } from '@shared/components/image-lightbox/image-lightbox.component';
import { ProfileHeaderComponent } from '@features/profile/components/profile-header/profile-header.component';
import { ProfileMediaGridComponent } from '@features/profile/components/profile-media-grid/profile-media-grid.component';
import { ProfileSkeletonComponent } from '@features/profile/components/profile-skeleton/profile-skeleton.component';
import { ProfileTabsComponent } from '@features/profile/components/profile-tabs/profile-tabs.component';
import { PostCardComponent } from '@features/home/components/post-card/post-card.component';
import { Post } from '@features/posts/models/post-view.model';
import { FeedService } from '@features/home/services/feed.service';
import { addIcons } from 'ionicons';
import { chevronBack } from 'ionicons/icons';
import { catchError, map, of, switchMap } from 'rxjs';
import { ProfileErrorFacade } from '../../errors/profile-error.facade';
import { SocialErrorFacade } from '../../errors/social-error.facade';
import { ProfileService } from '../../services/profile.service';
import { RelationshipService } from '../../services/relationship.service';
import { PostsApiService } from '@features/posts/services/posts-api.service';
import { projectProfilePosts } from '@features/profile/utils/profile-post-projection';
import { buildPostDetailUrl } from '@features/posts/utils/post-detail-url.util';
import { ProfileTab } from '../../models/profile-tab.model';
import { createProfilePostsLoader } from '../../utils/profile-posts.loader';
import { toProfileMedia } from '../../utils/profile-view.utils';
import {
  normalizeWebsiteUrl,
  stripWebsiteProtocol,
} from '../../utils/website-url.utils';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.page.html',
  styleUrls: ['./user-profile.page.scss'],
  imports: [
    IonButton,
    IonContent,
    IonText,
    IonRefresher,
    IonRefresherContent,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    BackHeaderComponent,
    ProfileHeaderComponent,
    ProfileSkeletonComponent,
    ProfileTabsComponent,
    ProfileMediaGridComponent,
    PostCardComponent,
    ImageLightboxComponent,
    FollowButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserProfilePage implements ViewWillEnter, OnDestroy {
  private readonly navCtrl = inject(NavController);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly logger = inject(LoggerService);
  private readonly profileService = inject(ProfileService);
  private readonly profileErrorFacade = inject(ProfileErrorFacade);
  private readonly socialErrorFacade = inject(SocialErrorFacade);
  private readonly relationships = inject(RelationshipService);
  private readonly postsApi = inject(PostsApiService);
  private readonly feed = inject(FeedService);

  private readonly profileLoadError = signal<AppError | null>(null);

  private readonly userProfileResource = rxResource({
    stream: () =>
      this.route.paramMap.pipe(
        map((params) => params.get('username') || ''),
        switchMap((username: string) => {
          this.profileLoadError.set(null);
          if (!username) {
            return of(null);
          }
          return this.profileService.getPublicProfile(username).pipe(
            catchError((error: unknown) => {
              const appError = toAppError(error);
              this.profileLoadError.set(appError);
              // Rendered inline (see `profileErrorMessage`): no second toast.
              throw appError;
            }),
          );
        }),
      ),
  });

  readonly isLoadingProfile = computed(() =>
    this.userProfileResource.isLoading(),
  );

  readonly profile = computed(
    () =>
      (this.profileLoadError()
        ? null
        : this.userProfileResource.value()) ?? null,
  );

  readonly profileError = computed(() => this.profileLoadError());

  readonly isProfileNotFound = computed(() => {
    const error = this.profileError();
    return isAppError(error) && error.status === 404;
  });

  readonly profileErrorMessage = computed(() => {
    if (this.isProfileNotFound()) {
      return 'User not found.';
    }
    const error = this.profileError();
    return error
      ? this.profileErrorFacade.getMessage(error, 'profile')
      : 'Failed to load profile. Please try again.';
  });

  private readonly profileId = computed(() => this.profile()?.id ?? null);

  private readonly relationshipRef = computed(() => {
    const userId = this.profileId();
    return userId ? this.relationships.relationship(userId) : null;
  });

  readonly followsYou = computed(
    () => this.relationshipRef()?.().followsYou ?? false,
  );

  readonly isFollowing = computed(
    () => this.relationshipRef()?.().isFollowing ?? false,
  );

  readonly isTogglingFollow = computed(
    () => this.relationshipRef()?.().isToggling ?? false,
  );

  private readonly countsRef = computed(() => {
    const userId = this.profileId();
    return userId ? this.relationships.counts(userId) : null;
  });

  readonly followerCount = computed(
    () => this.countsRef()?.().followerCount ?? 0,
  );

  readonly followingCount = computed(
    () => this.countsRef()?.().followingCount ?? 0,
  );

  private readonly postsLoader = createProfilePostsLoader({
    fetchPage: (userId, cursor) =>
      this.postsApi.getUserPosts(userId, { cursor, includeTotal: true }),
    logger: this.logger,
  });

  readonly profilePosts = this.postsLoader.posts;
  readonly isLoadingPosts = this.postsLoader.isLoading;
  readonly hasMorePosts = this.postsLoader.hasMore;
  readonly postsNotFound = this.postsLoader.notFound;
  readonly postsCount = this.postsLoader.postsCount;

  readonly activeTab = signal<ProfileTab>('posts');
  readonly viewerOpen = signal(false);
  readonly viewerIndex = signal(0);

  readonly postCards = computed<Post[]>(() =>
    projectProfilePosts({
      dtos: this.profilePosts(),
      author: this.profile() ?? null,
      authorId: this.profileId(),
      createdPosts: this.feed.createdPosts(),
      overrides: this.feed.overrides(),
    }),
  );

  private readonly media = computed(() => {
    const removed = this.feed.overrides().removedIds;
    return toProfileMedia(
      this.profilePosts().filter((dto) => !removed.has(dto.id)),
    );
  });
  readonly mediaItems = computed(() => this.media().items);
  readonly mediaUrls = computed(() => this.media().urls);

  fullWebsiteUrl = computed(() =>
    normalizeWebsiteUrl(this.profile()?.website),
  );

  stripWebsite = (url: string | null | undefined): string =>
    stripWebsiteProtocol(url);

  constructor() {
    addIcons({ chevronBack });

    effect(() => {
      const profile = this.profile();
      if (!profile) {
        return;
      }
      // The store's own signals are written here; keep them out of the effect's
      // dependency graph so priming cannot retrigger this effect.
      untracked(() => {
        this.relationships.prime(profile.id, {
          isFollowing: profile.relationship?.isFollowing ?? false,
          followsYou: profile.relationship?.followsYou ?? false,
        });
        this.relationships
          .load(profile.id)
          .pipe(catchSocialError(this.socialErrorFacade, 'follow-counts'))
          .subscribe();
      });
    });

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
    const profile = this.profile();
    if (profile) {
      this.router.navigateByUrl(`followers/${profile.id}`);
    }
  }

  goToFollowings() {
    const profile = this.profile();
    if (profile) {
      this.router.navigateByUrl(`followings/${profile.id}`);
    }
  }

  ionViewWillEnter(): void {
    // Re-entering after viewing a Post detail: refresh in place. The `effect`
    // above handles the first load once `profileId` resolves.
    const userId = this.profileId();
    if (userId) {
      this.postsLoader.refresh(userId);
    }
  }

  handleRefresh(event: CustomEvent) {
    this.userProfileResource.reload();
    const userId = this.profileId();
    if (userId) {
      this.postsLoader.refresh(userId);
    }
    setTimeout(
      () => (event.target as unknown as { complete: () => void }).complete(),
      600,
    );
  }

  retryProfile() {
    this.userProfileResource.reload();
    const userId = this.profileId();
    if (userId) {
      this.postsLoader.loadFirst(userId);
    }
  }

  ngOnDestroy() {
    this.postsLoader.destroy();
  }

  onTabChange(tab: ProfileTab) {
    this.activeTab.set(tab);
  }

  openMedia(index: number) {
    if (this.mediaUrls().length === 0) return;
    this.viewerIndex.set(index);
    this.viewerOpen.set(true);
  }

  closeViewer() {
    this.viewerOpen.set(false);
  }

  handlePostLike(postId: string) {
    this.feed.toggleLike(postId);
  }

  handlePostSave(postId: string) {
    this.feed.toggleSave(postId);
  }

  goToPostDetail(postId: string, imageIndex?: number) {
    if (postId) {
      this.router.navigateByUrl(buildPostDetailUrl(postId, imageIndex));
    }
  }

  toggleFollow() {
    const profile = this.profile();
    if (!profile || this.isTogglingFollow()) return;

    const wasFollowing = this.isFollowing();
    this.relationships
      .toggle(profile.id)
      .pipe(
        catchSocialError(
          this.socialErrorFacade,
          followActionContext(wasFollowing),
        ),
      )
      .subscribe();
  }
}
