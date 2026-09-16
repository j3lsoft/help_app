import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { IonIcon, IonImg, IonText } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  bookmark,
  bookmarkOutline,
  chatboxEllipsesOutline,
  ellipsisVertical,
  heart,
  heartOutline,
  imagesOutline,
  shareOutline,
} from 'ionicons/icons';
import { PostMediaCarouselComponent } from '@shared/components/post-media-carousel/post-media-carousel.component';
import { ExpandableTextComponent } from '@shared/components/expandable-text/expandable-text.component';
import { ShortNumberPipe } from '@shared/pipes/short-number.pipe';
import { TimeAgoPipe } from '@shared/pipes/time-ago.pipe';

export interface Post {
  id: string;
  userProfilePic: string;
  userName: string;
  /** Author handle without the leading `@`. */
  username: string;
  aboutPost: string;
  postLikes: string;
  postComments: string;
  postShares: string;
  postSaves?: string;
  postSaved?: boolean;
  /** First image, or '' for text-only Posts. Deprecated: prefer postImages. */
  postImage: string;
  /** Ordered carousel images. Empty for text-only Posts. */
  postImages: string[];
  postLike: boolean;
  /** ISO publish date, rendered as relative time in the masthead. */
  createdAt?: string;
}

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [
    IonImg,
    IonText,
    IonIcon,
    ExpandableTextComponent,
    PostMediaCarouselComponent,
    ShortNumberPipe,
    TimeAgoPipe,
  ],
  templateUrl: './post-card.component.html',
  styleUrls: ['./post-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostCardComponent {
  post = input.required<Post>();
  userClick = output<string>();
  likeClick = output<void>();
  commentClick = output<void>();
  saveClick = output<void>();
  shareClick = output<void>();
  /** Tapping the media opens the post detail. */
  postClick = output<string>();

  readonly authorInitial = computed(() => {
    const name = (this.post().userName ?? '').trim();
    return (name.charAt(0) || '•').toUpperCase();
  });

  constructor() {
    addIcons({
      heart,
      heartOutline,
      chatboxEllipsesOutline,
      bookmark,
      bookmarkOutline,
      shareOutline,
      ellipsisVertical,
      imagesOutline,
    });
  }
}
