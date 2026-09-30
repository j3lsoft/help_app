import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { IonImg } from '@ionic/angular/standalone';

/**
 * Dumb swipeable carousel for ordered post media (1..N images).
 * Single image renders plainly; multiple render a scroll-snap track with dots.
 * Renders nothing when empty (text-only Posts).
 * Emits `imageTap` with the image index only on a deliberate tap, never on a swipe.
 * `initialIndex` pins which image is shown first (e.g. the one tapped in a list).
 */
@Component({
  selector: 'app-post-media-carousel',
  templateUrl: './post-media-carousel.component.html',
  styleUrls: ['./post-media-carousel.component.scss'],
  imports: [IonImg],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostMediaCarouselComponent implements AfterViewChecked {
  readonly images = input.required<string[]>();
  readonly initialIndex = input(0);
  readonly activeIndex = signal(0);
  readonly imageTap = output<number>();

  private readonly track = viewChild<ElementRef<HTMLElement>>('track');

  private pointerStartX: number | null = null;
  private dragged = false;

  private lastImages: readonly string[] | null = null;
  private appliedIndex: number | null = null;
  private scrolledFor: number | null = null;

  ngAfterViewChecked(): void {
    const images = this.images();
    const index = this.initialIndex();
    const imagesChanged = images !== this.lastImages;
    this.lastImages = images;

    if (images.length <= 1) {
      return;
    }
    const el = this.track()?.nativeElement;
    if (!el) {
      return;
    }
    // Re-pin on a new image set (route reuse / Post change) or a new index.
    if (imagesChanged || this.appliedIndex !== index) {
      this.appliedIndex = index;
      this.scrolledFor = null;
      this.goToSlide(index);
    }
    // Scroll is only measurable after layout; retry until it is, then stop so a
    // user swipe is not fought on later change-detection passes.
    if (this.scrolledFor !== index && el.clientWidth > 0) {
      this.scrolledFor = index;
      const clamped = Math.max(0, Math.min(index, images.length - 1));
      el.scrollLeft = clamped * el.clientWidth;
    }
  }

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

  onPointerDown(event: PointerEvent): void {
    this.pointerStartX = event.clientX;
    this.dragged = false;
  }

  onPointerMove(event: PointerEvent): void {
    if (this.pointerStartX === null) {
      return;
    }
    if (Math.abs(event.clientX - this.pointerStartX) > 8) {
      this.dragged = true;
    }
  }

  onPointerUp(): void {
    this.pointerStartX = null;
  }

  onImageClick(index: number): void {
    if (this.dragged) {
      this.dragged = false;
      return;
    }
    this.imageTap.emit(index);
  }
}
