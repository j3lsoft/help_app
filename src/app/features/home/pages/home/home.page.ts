import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { SocialErrorFacade } from '@features/profile/errors/social-error.facade';
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
  ViewWillEnter,
} from '@ionic/angular/standalone';
import { TopBarComponent } from '@shared/components/top-bar/top-bar.component';
import { addIcons } from 'ionicons';
import { search } from 'ionicons/icons';
import { PostCardComponent } from '../../components/post-card/post-card.component';
import {
  StoryListComponent,
  UserStory,
} from '../../components/story-list/story-list.component';
import { SuggestionListComponent } from '../../components/suggestion-list/suggestion-list.component';
import { MOCK_USERS_STORIES } from '../../data/home.mock';
import { FeedService } from '../../services/feed.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports: [
    IonContent,
    IonIcon,
    IonImg,
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
  private readonly socialErrorFacade = inject(SocialErrorFacade);
  private readonly feed = inject(FeedService);

  readonly usersStories = signal<UserStory[]>(MOCK_USERS_STORIES);
  readonly postsList = this.feed.posts;

  readonly suggestionsList = this.followService.suggestions;

  constructor() {
    addIcons({ search });
  }

  ionViewWillEnter(): void {
    this.followService
      .refreshSuggestions()
      .pipe(catchSocialError(this.socialErrorFacade, 'suggestions'))
      .subscribe();
  }

  goTo(screen: string) {
    this.router.navigateByUrl(screen);
  }

  goToUserProfile(username: string) {
    this.router.navigateByUrl(`user-profile/${username}`);
  }

  goToPostDetail(postId: string) {
    this.router.navigateByUrl(`post-detail/${postId}`);
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
          this.socialErrorFacade,
          followActionContext(isFollowing),
        ),
      )
      .subscribe();
  }
}
