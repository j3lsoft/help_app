import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonImg,
  IonSpinner,
  IonText,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowForwardOutline,
  cameraOutline,
  close,
  imagesOutline,
} from 'ionicons/icons';
import { firstValueFrom } from 'rxjs';
import { CameraService } from '@core/services/camera/camera.service';
import { LoggerService } from '@core/services/logger.service';
import { UploadApiService } from '@core/services/media/upload/services/upload-api.service';
import { DeviceGalleryService } from '../../services/device-gallery.service';
import { PostCreationService } from '../../services/post-creation.service';

@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.page.html',
  styleUrls: ['./create-post.page.scss'],
  imports: [
    IonButton,
    IonContent,
    IonHeader,
    IonIcon,
    IonImg,
    IonSpinner,
    IonText,
    IonToolbar,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreatePostPage {
  private readonly router = inject(Router);
  private readonly logger = inject(LoggerService);
  private readonly deviceGallery = inject(DeviceGalleryService);
  private readonly camera = inject(CameraService);
  private readonly uploadApi = inject(UploadApiService);

  readonly postCreation = inject(PostCreationService);

  readonly selectedImageSrc = this.postCreation.selectedImageSrc;
  readonly hasSelectedImage = this.postCreation.hasSelectedImage;
  readonly isSelecting = signal(false);

  readonly canContinue = computed(() => !this.isSelecting());

  constructor() {
    addIcons({ close, arrowForwardOutline, imagesOutline, cameraOutline });
  }

  goHome(): void {
    if (this.postCreation.pendingMediaId()) {
      void this.discardPendingMedia();
    }
    this.router.navigateByUrl('/tabs/home');
  }

  async pickFromGallery(): Promise<void> {
    await this.selectFrom(
      () => this.deviceGallery.pickFromGallery(),
      'gallery'
    );
  }

  async takePhoto(): Promise<void> {
    await this.selectFrom(async () => {
      const result = await this.camera.takePhoto({ quality: 90 });
      return { src: result.dataUrl, format: result.format };
    }, 'camera');
  }

  goToPostFilter(): void {
    if (this.isSelecting()) {
      return;
    }
    // Text-only mode skips the filter/edit step straight to caption.
    if (!this.hasSelectedImage()) {
      this.router.navigate(['/post-caption-and-tag']);
      return;
    }
    this.router.navigate(['/post-filter']);
  }

  private async selectFrom(
    pick: () => Promise<{ src: string; format: string } | null>,
    origin: 'gallery' | 'camera'
  ): Promise<void> {
    if (this.isSelecting()) {
      return;
    }

    this.isSelecting.set(true);
    try {
      const result = await pick();
      // User dismissed the picker; keep any previous selection.
      if (!result?.src) {
        return;
      }
      this.postCreation.selectImage({ ...result, origin });
    } catch (error) {
      this.logger.error('Photo selection failed', {
        context: 'CreatePostPage',
        data: { origin, message: String(error) },
      });
    } finally {
      this.isSelecting.set(false);
    }
  }

  /** Best-effort cleanup of media uploaded in a failed publish attempt. */
  private async discardPendingMedia(): Promise<void> {
    const mediaFileId = this.postCreation.pendingMediaId();
    if (!mediaFileId) {
      return;
    }
    this.postCreation.setPendingMediaId(null);
    try {
      await firstValueFrom(this.uploadApi.deleteFile(mediaFileId));
      this.logger.debug('Discarded orphaned media after flow exit', {
        context: 'CreatePostPage',
        data: { mediaFileId },
      });
    } catch (error) {
      this.logger.warn('Could not discard orphaned media', {
        context: 'CreatePostPage',
        data: { mediaFileId, message: String(error) },
      });
    }
  }
}
