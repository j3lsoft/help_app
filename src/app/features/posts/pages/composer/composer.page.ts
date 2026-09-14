import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonIcon,
  IonModal,
  IonProgressBar,
  IonSpinner,
  IonText,
  IonTextarea,
  ViewWillLeave,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  cameraOutline,
  close,
  imageOutline,
} from 'ionicons/icons';
import { firstValueFrom } from 'rxjs';
import { CameraService } from '@core/services/camera/camera.service';
import { LoggerService } from '@core/services/logger.service';
import { NotificationService } from '@core/services/notification.service';
import { UploadApiService } from '@core/services/media/upload/services/upload-api.service';
import { clearServerFieldErrors } from '@core/utils/server-validation-errors.utils';
import { handleInlineFormError } from '@core/utils/form-error-handler.utils';
import { AuthService } from '@features/auth/services/auth.service';
import { FeedService } from '@features/home/services/feed.service';
import { BackHeaderComponent } from '@shared/components/back-header/back-header.component';
import { PostErrorFacade } from '../../errors/post-error.facade';
import { DeviceGalleryService } from '../../services/device-gallery.service';
import { PostCreationService } from '../../services/post-creation.service';
import {
  PostPublishError,
  PostPublishService,
  PublishStage,
} from '../../services/post-publish.service';
import { toFeedPost } from '../../utils/post-view.adapter';
import { PhotoEditorComponent } from '../../components/photo-editor/photo-editor.component';
import { MediaGridComponent } from '../../components/media-grid/media-grid.component';

export const CAPTION_MAX_LENGTH = 2200;

@Component({
  selector: 'app-composer',
  templateUrl: './composer.page.html',
  styleUrls: ['./composer.page.scss'],
  imports: [
    BackHeaderComponent,
    IonContent,
    IonIcon,
    IonModal,
    IonProgressBar,
    IonSpinner,
    IonText,
    IonTextarea,
    MediaGridComponent,
    PhotoEditorComponent,
    ReactiveFormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComposerPage implements ViewWillLeave {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly logger = inject(LoggerService);
  private readonly deviceGallery = inject(DeviceGalleryService);
  private readonly camera = inject(CameraService);
  private readonly uploadApi = inject(UploadApiService);
  readonly postCreation = inject(PostCreationService);
  private readonly postPublish = inject(PostPublishService);
  private readonly postErrorFacade = inject(PostErrorFacade);
  private readonly notification = inject(NotificationService);
  private readonly auth = inject(AuthService);
  private readonly feed = inject(FeedService);

  readonly captionMaxLength = CAPTION_MAX_LENGTH;
  readonly currentUser = this.auth.currentUser;

  readonly isEditorOpen = signal(false);
  readonly isSelecting = signal(false);
  readonly isPublishing = signal(false);
  readonly publishStage = signal<PublishStage | null>(null);
  readonly uploadProgress = signal(0);
  private publishedSuccessfully = false;

  readonly form = this.fb.nonNullable.group({
    caption: ['', [Validators.maxLength(CAPTION_MAX_LENGTH)]],
  });

  private readonly contentSignal = signal(this.form.getRawValue());

  readonly canPublish = computed(() => {
    if (this.isPublishing()) {
      return false;
    }
    if (this.postCreation.hasMedia()) {
      return true;
    }
    const { caption } = this.contentSignal();
    return caption.trim().length > 0;
  });

  constructor() {
    addIcons({
      close,
      imageOutline,
      cameraOutline,
    });
    this.form.valueChanges.subscribe(() =>
      this.contentSignal.set(this.form.getRawValue())
    );
  }

  goHome(): void {
    const items = this.postCreation.mediaItems();
    const pendingIds = items.map((i) => i.pendingMediaId).filter((id): id is string => Boolean(id));
    if (pendingIds.length > 0) {
      void this.discardPendingMedias(pendingIds);
    }
    this.postCreation.reset();
    this.router.navigateByUrl('/tabs/home');
  }

  async pickFromGallery(): Promise<void> {
    if (this.isSelecting() || !this.postCreation.canAddMedia()) {
      return;
    }
    this.isSelecting.set(true);
    try {
      const remaining = this.postCreation.remainingSlots();
      const selected = await this.deviceGallery.pickFromGallery(remaining);
      if (selected.length > 0) {
        this.postCreation.addImages(selected);
      }
    } catch (error) {
      this.logger.error('Photo selection from gallery failed', {
        context: 'ComposerPage',
        data: { message: String(error) },
      });
    } finally {
      this.isSelecting.set(false);
    }
  }

  async takePhoto(): Promise<void> {
    if (this.isSelecting() || !this.postCreation.canAddMedia()) {
      return;
    }
    this.isSelecting.set(true);
    try {
      const result = await this.camera.takePhoto({ quality: 90 });
      if (result?.dataUrl) {
        this.postCreation.addImage({
          src: result.dataUrl,
          format: result.format ?? 'jpeg',
          origin: 'camera',
        });
      }
    } catch (error) {
      this.logger.error('Photo capture from camera failed', {
        context: 'ComposerPage',
        data: { message: String(error) },
      });
    } finally {
      this.isSelecting.set(false);
    }
  }

  openEditor(itemId: string): void {
    this.postCreation.setActiveItem(itemId);
    this.isEditorOpen.set(true);
  }

  closeEditor(): void {
    this.isEditorOpen.set(false);
  }

  removeItem(itemId: string): void {
    this.postCreation.removeItem(itemId);
  }

  onReorder(orderedIds: string[]): void {
    this.postCreation.reorderItems(orderedIds);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (!files || files.length === 0 || !this.postCreation.canAddMedia()) {
      return;
    }
    const remaining = this.postCreation.remainingSlots();
    const items = this.deviceGallery.fromFiles(files, remaining);
    this.postCreation.addImages(items);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  async publish(): Promise<void> {
    clearServerFieldErrors(this.form);

    if (this.isPublishing()) {
      return;
    }
    const content = this.buildContent();
    const items = this.postCreation.mediaItems();
    const hasMedia = items.length > 0;
    if (!hasMedia && !content) {
      return;
    }

    this.isPublishing.set(true);
    this.uploadProgress.set(0);
    this.publishStage.set('baking');

    try {
      const result = await this.postPublish.publish({
        items: [...items],
        content,
        onStage: (stage) => this.publishStage.set(stage),
        onUploadProgress: (percent) => this.uploadProgress.set(percent),
      });

      this.publishedSuccessfully = true;

      // Optimistic insert into feed
      this.feed.prependPost(
        toFeedPost(
          result.post,
          this.auth.currentUser(),
          items[0]?.image.src ?? ''
        )
      );

      this.postCreation.reset();
      await this.notification.showSuccess('Post published');
      await this.router.navigate(['/tabs/home'], { replaceUrl: true });
    } catch (error) {
      this.logger.error('Failed to publish post', {
        context: 'ComposerPage',
        data: { message: String(error) },
      });

      if (error instanceof PostPublishError && error.uploadedMediaIds) {
        // Save pending ids back on items
        items.forEach((item, idx) => {
          if (error.uploadedMediaIds![idx]) {
            this.postCreation.setItemPendingMediaId(item.id, error.uploadedMediaIds![idx]);
          }
        });
      }

      handleInlineFormError({
        error,
        form: this.form,
        context: 'publish',
        facade: this.postErrorFacade,
      });
    } finally {
      this.isPublishing.set(false);
      this.publishStage.set(null);
    }
  }

  ionViewWillLeave(): void {
    const items = this.postCreation.mediaItems();
    const pendingIds = items
      .map((i) => i.pendingMediaId)
      .filter((id): id is string => Boolean(id));

    if (this.publishedSuccessfully || pendingIds.length === 0) {
      return;
    }
    this.postCreation.reset();
    void this.discardPendingMedias(pendingIds);
  }

  private async discardPendingMedias(mediaFileIds: string[]): Promise<void> {
    for (const id of mediaFileIds) {
      try {
        await firstValueFrom(this.uploadApi.deleteFile(id));
      } catch (error) {
        this.logger.warn('Could not clean up orphaned media', {
          context: 'ComposerPage',
          data: { mediaFileId: id, message: String(error) },
        });
      }
    }
  }

  private buildContent(): string | null {
    const caption = this.form.getRawValue().caption.trim();
    return caption.length > 0 ? caption : null;
  }
}