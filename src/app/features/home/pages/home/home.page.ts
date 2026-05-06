import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonIcon, IonImg } from '@ionic/angular/standalone';
import { TopBarComponent } from '@shared/components/top-bar/top-bar.component';
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
import {
  Suggestion,
  SuggestionListComponent,
} from '../../components/suggestion-list/suggestion-list.component';
import {
  MOCK_OLD_POSTS,
  MOCK_SUGGESTIONS,
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
export class HomePage {
  private router = inject(Router);

  constructor() {
    addIcons({ search });
  }

  usersStories = signal<UserStory[]>(MOCK_USERS_STORIES);

  todaysPostsList = signal<Post[]>(MOCK_TODAY_POSTS);

  suggestionsList = signal<Suggestion[]>(MOCK_SUGGESTIONS);

  oldPostsList = signal<Post[]>(MOCK_OLD_POSTS);

  goTo(screen: string) {
    this.router.navigateByUrl(screen);
  }

  handlePostLike(list: 'today' | 'old', postId: string) {
    const signalToUpdate =
      list === 'today' ? this.todaysPostsList : this.oldPostsList;
    signalToUpdate.update((posts) =>
      posts.map((p) => (p.id === postId ? { ...p, postLike: !p.postLike } : p))
    );
  }

  handleFollowToggle(suggestion: Suggestion) {
    this.suggestionsList.update((suggestions) =>
      suggestions.map((s) =>
        s.id === suggestion.id ? { ...s, isFollow: !s.isFollow } : s
      )
    );
  }
}
