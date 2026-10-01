import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { IonIcon, IonImg, IonText } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  bookmark,
  bookmarkOutline,
  chatboxEllipsesOutline,
  ellipsisVertical,
  expandOutline,
  heart,
  heartOutline,
  imagesOutline,
  shareOutline,
} from 'ionicons/icons';
import { ImageLightboxComponent } from '@shared/components/image-lightbox/image-lightbox.component';
import { PostMediaCarouselComponent } from '@shared/components/post-media-carousel/post-media-carousel.component';
import { ExpandableTextComponent } from '@shared/components/expandable-text/expandable-text.component';
import { ShortNumberPipe } from '@shared/pipes/short-number.pipe';
import { TimeAgoPipe } from '@shared/pipes/time-ago.pipe';
import { Post } from '@features/posts/models/post-view.model';

/** Opens a Post from one of its images, carrying the tapped image index. */
interface PostMediaActivation {
  postId: string;
  imageIndex: number;
}

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [
    IonImg,
    IonText,
    IonIcon,
    ExpandableTextComponent,
    ImageLightboxComponent,
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
  /** Tapping anywhere but the media opens the post detail. */
  postClick = output<string>();
  /** Tapping one image opens the post detail pinned to that image. */
  mediaClick = output<PostMediaActivation>();

  /**
   * Lightbox state. The card owns it: the Post's own media is part of how the
   * card presents that Post, so the pages do not have to wire a fourth copy of
   * the viewer. Opened from the media's expand button, not from a media tap.
   */
  readonly viewerOpen = signal(false);
  readonly viewerIndex = signal(0);

  /** Current media to open the viewer on; `undefined` for text-only Posts. */
  private readonly carousel = viewChild(PostMediaCarouselComponent);

  readonly authorInitial = computed(() => {
    const name = (this.post().userName ?? '').trim();
    return (name.charAt(0) || '•').toUpperCase();
  });

  openPost(): void {
    this.postClick.emit(this.post().id);
  }

  activateMedia(imageIndex: number): void {
    this.mediaClick.emit({ postId: this.post().id, imageIndex });
  }

  openViewer(index: number): void {
    if (this.post().postImages.length === 0) {
      return;
    }
    this.viewerIndex.set(index);
    this.viewerOpen.set(true);
  }

  /** Opens the viewer on the image the carousel is currently showing. */
  openViewerFromCarousel(): void {
    this.openViewer(this.carousel()?.activeIndex() ?? 0);
  }

  closeViewer(): void {
    this.viewerOpen.set(false);
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
      expandOutline,
      imagesOutline,
    });
  }
}
