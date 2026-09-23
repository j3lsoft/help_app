import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  afterNextRender,
  input,
  linkedSignal,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { IonIcon, IonModal } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';

/**
 * Fullscreen image viewer for a list of image URLs.
 * Presents itself as a modal, swipes between images and emits `closed` when
 * dismissed so the owner can unmount it with a plain `@if`.
 */
@Component({
  selector: 'app-image-lightbox',
  templateUrl: './image-lightbox.component.html',
  styleUrls: ['./image-lightbox.component.scss'],
  imports: [IonIcon, IonModal],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageLightboxComponent {
  readonly images = input.required<string[]>();
  readonly startIndex = input(0);
  readonly closed = output<void>();

  readonly activeIndex = linkedSignal(() => this.startIndex());
  readonly isOpen = signal(true);

  private readonly closeButton =
    viewChild<ElementRef<HTMLButtonElement>>('closeButton');

  constructor() {
    addIcons({ closeOutline });
    afterNextRender(() => this.closeButton()?.nativeElement.focus());
  }

  close(): void {
    this.isOpen.set(false);
  }

  onSlideChange(event: Event): void {
    // Swiper Element re-dispatches `slideChange` while it is still building the
    // new instance, so `event.target.swiper` can briefly point at the previous,
    // already-destroyed instance whose `activeIndex` is `undefined`. Only trust
    // a finite index, otherwise opening on a non-first image corrupts the
    // counter (`undefined + 1` renders `NaN`).
    const index = (event.target as { swiper?: { activeIndex?: number } }).swiper
      ?.activeIndex;
    if (typeof index === 'number' && Number.isFinite(index)) {
      this.activeIndex.set(index);
    }
  }
}
