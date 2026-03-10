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

  usersStories = signal<UserStory[]>([
    {
      id: '1',
      userProfilePic: '../../../../assets/images/users/user1.png',
      storySeen: false,
      userName: 'Shree',
    },
    {
      id: '2',
      userProfilePic: '../../../../assets/images/users/user2.png',
      storySeen: false,
      userName: 'Alicia',
    },
    {
      id: '3',
      userProfilePic: '../../../../assets/images/users/user3.png',
      storySeen: false,
      userName: 'Denny',
    },
    {
      id: '4',
      userProfilePic: '../../../../assets/images/users/user4.png',
      storySeen: true,
      userName: 'Smiti',
    },
    {
      id: '5',
      userProfilePic: '../../../../assets/images/users/user5.png',
      storySeen: true,
      userName: 'Imran',
    },
    {
      id: '6',
      userProfilePic: '../../../../assets/images/users/user6.png',
      storySeen: true,
      userName: 'Dolly',
    },
    {
      id: '7',
      userProfilePic: '../../../../assets/images/users/user7.png',
      storySeen: true,
      userName: 'Denver',
    },
    {
      id: '8',
      userProfilePic: '../../../../assets/images/users/user8.png',
      storySeen: true,
      userName: 'Isha',
    },
    {
      id: '9',
      userProfilePic: '../../../../assets/images/users/user9.png',
      storySeen: true,
      userName: 'Trisha',
    },
    {
      id: '10',
      userProfilePic: '../../../../assets/images/users/user10.png',
      storySeen: true,
      userName: 'Roy',
    },
  ]);

  private dummyText =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ipsum amet pellentesque in rhoncus, in erat. Placerat et nunc ipsum donec urna feugiat suspendisse.';

  todaysPostsList = signal<Post[]>([
    {
      id: '1',
      userProfilePic: '../../../../assets/images/users/user2.png',
      userName: 'Alicia Sierra',
      userDetail: 'Allentown, New Mexico',
      aboutPost: this.dummyText,
      postLikes: '10k',
      postComments: '100',
      postShares: '35',
      postImage: '../../../../assets/images/posts/post1.png',
      postLike: true,
    },
    {
      id: '2',
      userProfilePic: '../../../../assets/images/users/user4.png',
      userName: 'Smiti Khana',
      userDetail: 'Allentown, New Mexico',
      aboutPost: this.dummyText,
      postLikes: '10k',
      postComments: '100',
      postShares: '35',
      postImage: '../../../../assets/images/posts/post2.png',
      postLike: false,
    },
  ]);

  suggestionsList = signal<Suggestion[]>([
    {
      id: '1',
      userProfilePic: '../../../../assets/images/users/user11.png',
      userName: 'Tina Shah',
      userAbout: 'realtinashah',
      isFollow: false,
    },
    {
      id: '2',
      userProfilePic: '../../../../assets/images/users/user12.png',
      userName: 'Jiya Patel',
      userAbout: 'officialjiya',
      isFollow: false,
    },
    {
      id: '3',
      userProfilePic: '../../../../assets/images/users/user13.png',
      userName: 'Joy Jain',
      userAbout: 'joyyyyy',
      isFollow: false,
    },
    {
      id: '4',
      userProfilePic: '../../../../assets/images/users/user14.png',
      userName: 'Ishan Patel',
      userAbout: 'ishanpatel',
      isFollow: false,
    },
    {
      id: '5',
      userProfilePic: '../../../../assets/images/users/user11.png',
      userName: 'Tina Shah',
      userAbout: 'realtinashah',
      isFollow: false,
    },
  ]);

  oldPostsList = signal<Post[]>([
    {
      id: 'o1',
      userProfilePic: '../../../../assets/images/users/user3.png',
      userName: 'Denny John',
      userDetail: 'Allentown, New Mexico',
      aboutPost: this.dummyText,
      postLikes: '10k',
      postComments: '100',
      postShares: '35',
      postImage: '../../../../assets/images/posts/post3.png',
      postLike: true,
    },
    {
      id: 'o2',
      userProfilePic: '../../../../assets/images/users/user8.png',
      userName: 'Roy Khurana',
      userDetail: 'Allentown, New Mexico',
      aboutPost: this.dummyText,
      postLikes: '10k',
      postComments: '100',
      postShares: '35',
      postImage: '../../../../assets/images/posts/post4.png',
      postLike: false,
    },
    {
      id: 'o3',
      userProfilePic: '../../../../assets/images/users/user10.png',
      userName: 'Ishan Khatri',
      userDetail: 'Allentown, New Mexico',
      aboutPost: this.dummyText,
      postLikes: '10k',
      postComments: '100',
      postShares: '35',
      postImage: '../../../../assets/images/posts/post5.png',
      postLike: false,
    },
  ]);

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
