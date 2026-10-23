import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { ErrorMapConfig } from '@core/errors/error-map.interface';
import { ErrorFacade } from '@core/errors/facades/error.facade';
import { AppError } from '@core/models/app-error.model';
import { FollowService } from '@features/profile/services/follow.service';
import { RelationshipService } from '@features/profile/services/relationship.service';
import {
  catchSocialError,
  followActionContext,
} from '@features/profile/utils/social-page-error.utils';
import {
  IonContent,
  IonIcon,
  IonImg,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonRefresher,
  IonRefresherContent,
  ViewWillEnter,
} from '@ionic/angular/standalone';
import { TopBarComponent } from '@shared/components/top-bar/top-bar.component';
import { addIcons } from 'ionicons';
import { search } from 'ionicons/icons';
import { catchError, EMPTY, finalize } from 'rxjs';
import { PostCardComponent } from '../../components/post-card/post-card.component';
import { buildPostDetailUrl } from '@features/posts/utils/post-detail-url.util';
import {
  StoryListComponent,
  UserStory,
} from '../../components/story-list/story-list.component';
import { SuggestionListComponent } from '../../components/suggestion-list/suggestion-list.component';
import { MOCK_USERS_STORIES } from '../../data/home.mock';
import { FeedService } from '../../services/feed.service';

/** Feed failures outside the technical band (0/429/5xx, handled elsewhere). */
const FEED_ERROR_MAP: ErrorMapConfig = {
  byStatus: {
    401: 'Your session has expired. Please sign in again.',
  },
  fallback: 'Could not load the feed. Please try again.',
};

function catchFeedError(errorFacade: ErrorFacade) {
  return catchError((error: AppError) => {
    errorFacade.handle(error, FEED_ERROR_MAP);
    return EMPTY;
  });
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports: [
    IonContent,
    IonIcon,
    IonImg,
    IonRefresher,
    IonRefresherContent,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    TopBarComponent,
    StoryListComponent,
    PostCardComponent,
    SuggestionListComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage implements ViewWillEnter {
  private router = inject(Router);
  private readonly followService = inject(FollowService);
  private readonly relationships = inject(RelationshipService);
  private readonly errorFacade = inject(ErrorFacade);
  private readonly feed = inject(FeedService);

  readonly usersStories = signal<UserStory[]>(MOCK_USERS_STORIES);
  readonly postsList = this.feed.posts;
  readonly hasMorePosts = this.feed.hasMore;

  readonly suggestionsList = this.followService.suggestions;

  constructor() {
    addIcons({ search });
  }

  ionViewWillEnter(): void {
    this.followService
      .refreshSuggestions()
      .pipe(catchSocialError(this.errorFacade, 'suggestions'))
      .subscribe();

    this.feed.refresh().pipe(catchFeedError(this.errorFacade)).subscribe();
  }

  loadMorePosts(event: CustomEvent): void {
    const complete = () =>
      (event.target as unknown as { complete: () => void }).complete();

    if (!this.feed.hasMore()) {
      complete();
      return;
    }

    this.feed
      .loadMore()
      .pipe(catchFeedError(this.errorFacade), finalize(complete))
      .subscribe();
  }

  handleRefresh(event: CustomEvent): void {
    this.feed
      .refresh()
      .pipe(
        catchFeedError(this.errorFacade),
        finalize(() =>
          (event.target as unknown as { complete: () => void }).complete()
        )
      )
      .subscribe();
  }

  goTo(screen: string) {
    this.router.navigateByUrl(screen);
  }

  goToUserProfile(username: string) {
    this.router.navigateByUrl(`user-profile/${username}`);
  }

  goToPostDetail(postId: string, imageIndex?: number) {
    this.router.navigateByUrl(buildPostDetailUrl(postId, imageIndex));
  }

  goToComments(postId: string) {
    this.router.navigateByUrl(`post-detail/${postId}`);
  }

  handlePostLike(postId: string) {
    this.feed.toggleLike(postId);
  }

  handlePostSave(postId: string) {
    this.feed.toggleSave(postId);
  }

  handleFollowToggle(userId: string) {
    const isFollowing = this.relationships.relationship(userId)().isFollowing;
    this.relationships
      .toggle(userId)
      .pipe(
        catchSocialError(
          this.errorFacade,
          followActionContext(isFollowing),
        ),
      )
      .subscribe();
  }
}
