import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  computed,
  inject,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { LoggerService } from '@core/services/logger.service';
import { toAppError } from '@core/utils/app-error.utils';
import { AuthService } from '@features/auth/services/auth.service';
import { ProfileHeaderComponent } from '@features/profile/components/profile-header/profile-header.component';
import { ProfilePostGridComponent } from '@features/profile/components/profile-post-grid/profile-post-grid.component';
import { FollowService } from '@features/profile/services/follow.service';
import { ProfileService } from '@features/profile/services/profile.service';
import { PostsApiService } from '@features/posts/services/posts-api.service';
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
import { PostItem } from '../../models/post-item.model';
import { createProfilePostsLoader } from '../../utils/profile-posts.loader';
import { toProfileHeaderViewModel } from '../../utils/profile-view.utils';
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
    ProfilePostGridComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePage implements ViewWillEnter, OnDestroy {
  private navCtrl = inject(NavController);
  private router = inject(Router);
  private logger = inject(LoggerService);
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);
  private followService = inject(FollowService);
  private postsApi = inject(PostsApiService);
  private readonly profileErrorFacade = inject(ProfileErrorFacade);
  private readonly socialErrorFacade = inject(SocialErrorFacade);

  private readonly postsLoader = createProfilePostsLoader({
    fetchPage: (userId, cursor) => this.postsApi.getUserPosts(userId, { cursor }),
    logger: this.logger,
  });

  readonly profilePosts = this.postsLoader.posts;
  readonly isLoadingPosts = this.postsLoader.isLoading;
  readonly hasMorePosts = this.postsLoader.hasMore;
  readonly postsNotFound = this.postsLoader.notFound;
  readonly postsCount = this.postsLoader.postsCount;

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

    return toProfileHeaderViewModel({
      source: fullProfile ?? authUser,
      fullProfile,
      followerCount: this.followService.followerCount(),
      followingCount: this.followService.followingCount(),
      postsCount: this.postsCount(),
    });
  });

  ionViewWillEnter() {
    const userId = this.authService.currentUser()?.id;
    if (!userId) return;

    this.followService
      .loadSocialState(userId)
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
      this.followService
        .loadSocialState(userId)
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

  onPostClick(post: PostItem) {
    if (post.id) {
      this.router.navigateByUrl(`post-detail/${post.id}`);
    }
  }
}