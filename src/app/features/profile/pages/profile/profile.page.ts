import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { rxResource, toObservable } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { toAppError } from '@core/utils/app-error.utils';
import { AuthService } from '@features/auth/services/auth.service';
import { ProfileHeaderComponent } from '@features/profile/components/profile-header/profile-header.component';
import { ProfilePostGridComponent } from '@features/profile/components/profile-post-grid/profile-post-grid.component';
import { FollowService } from '@features/profile/services/follow.service';
import { ProfileService } from '@features/profile/services/profile.service';
import { PostsApiService } from '@features/posts/services/posts-api.service';
import {
  IonButtons,
  IonContent,
  IonMenuButton,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonText,
  IonButton,
  NavController,
  ViewWillEnter,
} from '@ionic/angular/standalone';
import { TopBarComponent } from '@shared/components/top-bar/top-bar.component';
import { of, catchError, map, switchMap } from 'rxjs';
import { ProfileErrorFacade } from '../../errors/profile-error.facade';
import { SocialErrorFacade } from '../../errors/social-error.facade';
import { toProfileHeaderViewModel } from '../../utils/profile-view.utils';
import { catchSocialError } from '../../utils/social-page-error.utils';
import { PostItem } from '../../models/post-item.model';

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
    IonButton,
    IonRefresher,
    IonRefresherContent,
    ProfileHeaderComponent,
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
  private postsApi = inject(PostsApiService);
  private readonly profileErrorFacade = inject(ProfileErrorFacade);
  private readonly socialErrorFacade = inject(SocialErrorFacade);

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

  private readonly authUserId$ = toObservable(
    computed(() => this.authService.currentUser()?.id ?? null)
  );

  readonly profilePostsResource = rxResource({
    stream: () =>
      this.authUserId$.pipe(
        switchMap((userId) => {
          if (!userId) return of<PostItem[]>([]);
          return this.postsApi.getPostsByAuthor(userId, 'desc').pipe(
            map((posts) =>
              [...posts]
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                )
                .map((p) => ({
                  id: p.id,
                  image: p.media?.[0]?.mediaFileId || 'assets/images/gallery/gallery1.png',
                  createdAt: p.createdAt,
                }))
            ),
            catchError(() => of<PostItem[]>([]))
          );
        })
      ),
  });

  isLoadingPosts = computed(() => this.profilePostsResource.isLoading());
  profilePosts = computed(() => this.profilePostsResource.value() ?? []);
  postsCount = computed(() => String(this.profilePosts().length));

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
  }

  handleRefresh(event: CustomEvent) {
    const userId = this.authService.currentUser()?.id;
    if (userId) {
      this.followService
        .loadSocialState(userId)
        .pipe(catchSocialError(this.socialErrorFacade, 'follow-counts'))
        .subscribe();
    }
    this.profileResource.reload();
    this.profilePostsResource.reload();
    setTimeout(() => (event.target as unknown as { complete: () => void }).complete(), 600);
  }

  retryProfile() {
    this.profileResource.reload();
    this.profilePostsResource.reload();
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
