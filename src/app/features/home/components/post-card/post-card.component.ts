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
import { Post } from '@features/posts/models/post-view.model';

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

  openPost(): void {
    this.postClick.emit(this.post().id);
  }

  onCardKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }
    event.preventDefault();
    this.openPost();
  }

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
