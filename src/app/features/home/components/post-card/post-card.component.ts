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
import { PostMediaCarouselComponent } from '@shared/components/post-media-carousel/post-media-carousel.component';

export interface Post {
  id: string;
  userProfilePic: string;
  userName: string;
  userDetail: string;
  aboutPost: string;
  postLikes: string;
  postComments: string;
  postShares: string;
  /** First image, or '' for text-only Posts. Deprecated: prefer postImages. */
  postImage: string;
  /** Ordered carousel images. Empty for text-only Posts. */
  postImages: string[];
  postLike: boolean;
}

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [IonImg, IonText, IonIcon, PostMediaCarouselComponent],
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
  /** Tapping the media opens the post detail. */
  postClick = output<string>();

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
