import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  computed,
  inject,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { LoggerService } from '@core/services/logger.service';
import { toAppError } from '@core/utils/app-error.utils';
import { AuthService } from '@features/auth/services/auth.service';
import { PostCardComponent } from '@features/home/components/post-card/post-card.component';
import { Post } from '@features/posts/models/post-view.model';
import { FeedService } from '@features/home/services/feed.service';
import { ProfileHeaderComponent } from '@features/profile/components/profile-header/profile-header.component';
import { ProfileMediaGridComponent } from '@features/profile/components/profile-media-grid/profile-media-grid.component';
import { ProfileTabsComponent } from '@features/profile/components/profile-tabs/profile-tabs.component';
import { ProfileService } from '@features/profile/services/profile.service';
import { RelationshipService } from '@features/profile/services/relationship.service';
import { toPostView } from '@features/posts/adapters/post-view.adapter';
import { PostsApiService } from '@features/posts/services/posts-api.service';
import { ImageLightboxComponent } from '@shared/components/image-lightbox/image-lightbox.component';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonMenuButton,
  IonRefresher,
  IonRefresherContent,
  IonText,
  NavController,
  ViewWillEnter,
} from '@ionic/angular/standalone';
import { TopBarComponent } from '@shared/components/top-bar/top-bar.component';
import { catchError } from 'rxjs';
import { ProfileErrorFacade } from '../../errors/profile-error.facade';
import { SocialErrorFacade } from '../../errors/social-error.facade';
import { ProfileTab } from '../../models/profile-tab.model';
import { createProfilePostsLoader } from '../../utils/profile-posts.loader';
import {
  toProfileHeaderViewModel,
  toProfileMedia,
} from '../../utils/profile-view.utils';
import { catchSocialError } from '../../utils/social-page-error.utils';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  imports: [
    TopBarComponent,
    IonButtons,
    IonMenuButton,
    IonContent,
    IonText,
    IonButton,
    IonRefresher,
    IonRefresherContent,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    ProfileHeaderComponent,
    ProfileTabsComponent,
    ProfileMediaGridComponent,
    PostCardComponent,
    ImageLightboxComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePage implements ViewWillEnter, OnDestroy {
  private navCtrl = inject(NavController);
  private router = inject(Router);
  private logger = inject(LoggerService);
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);
  private relationships = inject(RelationshipService);
  private postsApi = inject(PostsApiService);
  private feed = inject(FeedService);
  private readonly profileErrorFacade = inject(ProfileErrorFacade);
  private readonly socialErrorFacade = inject(SocialErrorFacade);

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
    this.profilePosts().map((dto) =>
      toPostView(dto, { author: this.authService.currentUser() }),
    ),
  );

  private readonly media = computed(() => toProfileMedia(this.profilePosts()));
  readonly mediaItems = computed(() => this.media().items);
  readonly mediaUrls = computed(() => this.media().urls);

  private readonly profileResource = rxResource({
    stream: () =>
      this.profileService.getMyProfile().pipe(
        catchError((error: unknown) => {
          const appError = toAppError(error);
          this.profileErrorFacade.handle(appError, 'profile');
          throw appError;
        }),
      ),
  });

  isLoadingProfile = computed(() => this.profileResource.isLoading());

  showProfileError = computed(() => !!this.profileResource.error());

  userProfile = computed(() => {
    const authUser = this.authService.currentUser();
    const fullProfile = this.profileService.currentProfile();

    if (!authUser) return null;

    const counts = this.relationships.counts(authUser.id)();
    return toProfileHeaderViewModel({
      source: fullProfile ?? authUser,
      fullProfile,
      followerCount: counts.followerCount,
      followingCount: counts.followingCount,
      postsCount: this.postsCount(),
    });
  });

  ionViewWillEnter() {
    const userId = this.authService.currentUser()?.id;
    if (!userId) return;

    this.relationships
      .load(userId)
      .pipe(catchSocialError(this.socialErrorFacade, 'follow-counts'))
      .subscribe();

    this.postsLoader.loadFirst(userId);
  }

  loadMorePosts(event: CustomEvent) {
    const userId = this.authService.currentUser()?.id;
    if (!userId) {
      (event.target as unknown as { complete: () => void }).complete();
      return;
    }
    this.postsLoader.loadMore(userId, () =>
      (event.target as unknown as { complete: () => void }).complete(),
    );
  }

  handleRefresh(event: CustomEvent) {
    const userId = this.authService.currentUser()?.id;
    if (userId) {
      this.relationships
        .load(userId)
        .pipe(catchSocialError(this.socialErrorFacade, 'follow-counts'))
        .subscribe();
      this.postsLoader.loadFirst(userId);
    }
    this.profileResource.reload();
    setTimeout(
      () => (event.target as unknown as { complete: () => void }).complete(),
      600,
    );
  }

  retryProfile() {
    this.profileResource.reload();
    const userId = this.authService.currentUser()?.id;
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

  goToPostDetail(postId: string) {
    if (postId) {
      this.router.navigateByUrl(`post-detail/${postId}`);
    }
  }

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
}
