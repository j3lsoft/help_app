import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
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
import { SocialErrorFacade } from '@features/profile/errors/social-error.facade';
import { FollowService } from '@features/profile/services/follow.service';
import { addIcons } from 'ionicons';
import { search } from 'ionicons/icons';
import {
  Post,
  PostCardComponent,
} from '../../components/post-card/post-card.component';
import {
  StoryListComponent,
  UserStory,
} from '../../components/story-list/story-list.component';
import { SuggestionListComponent } from '../../components/suggestion-list/suggestion-list.component';
import {
  MOCK_OLD_POSTS,
  MOCK_TODAY_POSTS,
  MOCK_USERS_STORIES,
} from '../../data/home.mock';
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
  private readonly socialErrorFacade = inject(SocialErrorFacade);

  readonly usersStories = signal<UserStory[]>(MOCK_USERS_STORIES);
  readonly todaysPostsList = signal<Post[]>(MOCK_TODAY_POSTS);
  readonly oldPostsList = signal<Post[]>(MOCK_OLD_POSTS);

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

  handlePostLike(list: 'today' | 'old', postId: string) {
    const signalToUpdate =
      list === 'today' ? this.todaysPostsList : this.oldPostsList;
    signalToUpdate.update((posts) =>
      posts.map((p) => (p.id === postId ? { ...p, postLike: !p.postLike } : p))
    );
  }

  handleFollowToggle(suggestion: { id: string; isFollow: boolean }) {
    this.followService
      .toggleFollow(suggestion.id, suggestion.isFollow)
      .pipe(
        catchSocialError(
          this.socialErrorFacade,
          followActionContext(suggestion.isFollow)
        )
      )
      .subscribe();
  }
}
