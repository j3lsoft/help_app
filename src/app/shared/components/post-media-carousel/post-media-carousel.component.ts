import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { IonImg } from '@ionic/angular/standalone';

/**
 * Dumb swipeable carousel for ordered post media (1..N images).
 * Single image renders plainly; multiple render a scroll-snap track with dots.
 * Renders nothing when empty (text-only Posts).
 */
@Component({
  selector: 'app-post-media-carousel',
  templateUrl: './post-media-carousel.component.html',
  styleUrls: ['./post-media-carousel.component.scss'],
  imports: [IonImg],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostMediaCarouselComponent {
  readonly images = input.required<string[]>();
  readonly activeIndex = signal(0);

  private readonly track = viewChild<ElementRef<HTMLElement>>('track');

  goToSlide(index: number): void {
    const count = this.images().length;
    if (count === 0) {
      return;
    }
    const clamped = Math.max(0, Math.min(index, count - 1));
    this.activeIndex.set(clamped);
    const el = this.track()?.nativeElement;
    if (el && el.clientWidth > 0) {
      el.scrollLeft = clamped * el.clientWidth;
    }
  }

  onTrackScroll(event: Event): void {
    const el = event.target as HTMLElement | null;
    if (!el || el.clientWidth === 0 || this.images().length === 0) {
      return;
    }
    const index = Math.round(el.scrollLeft / el.clientWidth);
    const clamped = Math.max(0, Math.min(index, this.images().length - 1));
    if (clamped !== this.activeIndex()) {
      this.activeIndex.set(clamped);
    }
  }
}
