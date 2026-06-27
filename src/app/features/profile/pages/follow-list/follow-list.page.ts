import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonSpinner,
  IonText,
  ViewWillEnter,
  NavController,
} from '@ionic/angular/standalone';
import { BackHeaderComponent } from '@shared/components/back-header/back-header.component';
import { FollowerListComponent } from '../../components/follower-list/follower-list.component';
import { FollowUserDto } from '../../models/follow.dto';
import { SocialErrorContext } from '../../errors/social-error.config';
import { SocialErrorFacade } from '../../errors/social-error.facade';
import { FollowService } from '../../services/follow.service';
import {
  catchSocialError,
  followActionContext,
} from '../../utils/social-page-error.utils';
import { addIcons } from 'ionicons';
import { peopleOutline } from 'ionicons/icons';
import { finalize, map } from 'rxjs';

export type FollowListMode = 'followers' | 'followings';

@Component({
  selector: 'app-follow-list',
  templateUrl: './follow-list.page.html',
  styleUrls: ['./follow-list.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    BackHeaderComponent,
    FollowerListComponent,
    IonContent,
    IonIcon,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonSpinner,
    IonText,
  ],
})
export class FollowListPage implements ViewWillEnter {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly navCtrl = inject(NavController);
  private readonly followService = inject(FollowService);
  private readonly socialErrorFacade = inject(SocialErrorFacade);

  private readonly userId = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('userId')))
  );

  readonly mode = toSignal(
    this.route.data.pipe(
      map((data) => (data['mode'] as FollowListMode) ?? 'followers')
    ),
    { initialValue: 'followers' as FollowListMode }
  );

  readonly pageTitle = computed(() =>
    this.mode() === 'followers' ? 'Followers' : 'Following'
  );

  readonly emptyMessage = computed(() =>
    this.mode() === 'followers' ? 'No followers yet' : 'No followings yet'
  );

  readonly items = computed(() =>
    this.mode() === 'followers'
      ? this.followService.followers()
      : this.followService.followings()
  );

  readonly loading = computed(() =>
    this.mode() === 'followers'
      ? this.followService.followersLoading()
      : this.followService.followingsLoading()
  );

  readonly hasMore = computed(() =>
    this.mode() === 'followers'
      ? this.followService.hasMoreFollowers()
      : this.followService.hasMoreFollowings()
  );

  readonly errorContext = computed(
    (): SocialErrorContext =>
      this.mode() === 'followers' ? 'followers' : 'followings'
  );

  readonly errorMessage = computed(() => {
    const error =
      this.mode() === 'followers'
        ? this.followService.followersError()
        : this.followService.followingsError();
    return error
      ? this.socialErrorFacade.getMessage(error, this.errorContext())
      : null;
  });

  constructor() {
    addIcons({ peopleOutline });
  }

  ionViewWillEnter() {
    const id = this.userId();
    if (id) {
      this.loadList(id, true);
    }
  }

  goBack() {
    this.navCtrl.back();
  }

  onToggleFollow(user: FollowUserDto) {
    this.followService
      .toggleFollow(user.id, user.isFollow)
      .pipe(
        catchSocialError(
          this.socialErrorFacade,
          followActionContext(user.isFollow)
        )
      )
      .subscribe();
  }

  onUserClick(username: string) {
    this.router.navigateByUrl(`user-profile/${username}`);
  }

  onLoadMore(event: CustomEvent) {
    const id = this.userId();
    if (!id) return;

    this.loadList(id, false, () => {
      (event.target as HTMLIonInfiniteScrollElement).complete();
    });
  }

  private loadList(
    userId: string,
    reset: boolean,
    onComplete?: () => void
  ): void {
    const load$ =
      this.mode() === 'followers'
        ? this.followService.loadFollowers(userId, reset)
        : this.followService.loadFollowings(userId, reset);

    load$
      .pipe(
        catchSocialError(this.socialErrorFacade, this.errorContext()),
        finalize(() => onComplete?.())
      )
      .subscribe();
  }
}
