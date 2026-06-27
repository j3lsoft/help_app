import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { IonIcon, IonImg, IonText } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  chatboxEllipsesOutline,
  ellipsisVertical,
  heart,
  heartOutline,
  shareSocial,
} from 'ionicons/icons';

export interface Post {
  id: string;
  userProfilePic: string;
  userName: string;
  userDetail: string;
  aboutPost: string;
  postLikes: string;
  postComments: string;
  postShares: string;
  postImage: string;
  postLike: boolean;
}

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [IonImg, IonText, IonIcon],
  templateUrl: './post-card.component.html',
  styleUrls: ['./post-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostCardComponent {
  post = input.required<Post>();
  userClick = output<string>();
  likeClick = output<void>();
  commentClick = output<void>();
  shareClick = output<void>();

  constructor() {
    addIcons({
      heart,
      heartOutline,
      chatboxEllipsesOutline,
      shareSocial,
      ellipsisVertical,
    });
  }
}
