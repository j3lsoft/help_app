import {
    ChangeDetectionStrategy,
    Component,
    inject,
    signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { HomeHeaderComponent } from '../../components/home-header/home-header.component';
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
  standalone: true,
  imports: [
    IonContent,
    HomeHeaderComponent,
    StoryListComponent,
    PostCardComponent,
    SuggestionListComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  private router = inject(Router);

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
