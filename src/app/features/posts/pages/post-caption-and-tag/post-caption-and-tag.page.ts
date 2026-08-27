import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonSpinner,
  IonText,
  IonToolbar,
  NavController,
  ViewWillLeave,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronBack } from 'ionicons/icons';
import { firstValueFrom } from 'rxjs';
import { NotificationService } from '@core/services/notification.service';
import { LoggerService } from '@core/services/logger.service';
import { UploadApiService } from '@core/services/media/upload/services/upload-api.service';
import {
  clearServerFieldErrors,
} from '@core/utils/server-validation-errors.utils';
import { handleInlineFormError } from '@core/utils/form-error-handler.utils';
import { AuthService } from '@features/auth/services/auth.service';
import { FeedService } from '@features/home/services/feed.service';
import { PostCreationService } from '../../services/post-creation.service';
import {
  PostPublishError,
  PostPublishService,
} from '../../services/post-publish.service';
import { PostErrorFacade } from '../../errors/post-error.facade';
import { toFeedPost } from '../../utils/post-view.adapter';

export const CAPTION_MAX_LENGTH = 2200;

@Component({
  selector: 'app-post-caption-and-tag',
  templateUrl: './post-caption-and-tag.page.html',
  styleUrls: ['./post-caption-and-tag.page.scss'],
  imports: [
    IonContent,
    IonHeader,
    IonIcon,
    IonInput,
    IonSpinner,
    IonText,
    IonToolbar,
    ReactiveFormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostCaptionAndTagPage implements ViewWillLeave {
  private readonly navCtrl = inject(NavController);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly logger = inject(LoggerService);
  private readonly postCreation = inject(PostCreationService);
  private readonly postPublish = inject(PostPublishService);
  private readonly postErrorFacade = inject(PostErrorFacade);
  private readonly uploadApi = inject(UploadApiService);
  private readonly notification = inject(NotificationService);
  private readonly auth = inject(AuthService);
  private readonly feed = inject(FeedService);

  readonly selectedImageSrc = this.postCreation.selectedImageSrc;
  readonly effectiveFilter = this.postCreation.effectiveFilter;
  readonly effectiveTransform = this.postCreation.effectiveTransform;
  readonly captionMaxLength = CAPTION_MAX_LENGTH;
  readonly isPublishing = signal(false);
  readonly uploadProgress = signal(0);
  private publishedSuccessfully = false;

  readonly form = this.fb.nonNullable.group({
    caption: ['', [Validators.maxLength(CAPTION_MAX_LENGTH)]],
    tags: [''],
  });

  readonly captionLength = () => this.form.controls.caption.value.length;

  constructor() {
    addIcons({ chevronBack });
    if (!this.postCreation.hasSelectedImage()) {
      this.navCtrl.back();
    }
  }

  goBack(): void {
    if (!this.isPublishing()) {
      this.navCtrl.back();
    }
  }

  /** Q9: media uploaded without a created post is cleaned up best-effort. */
  ionViewWillLeave(): void {
    const mediaFileId = this.postCreation.pendingMediaId();
    if (this.publishedSuccessfully || !mediaFileId) {
      return;
    }
    this.postCreation.reset();
    firstValueFrom(this.uploadApi.deleteFile(mediaFileId)).catch((error) => {
      this.logger.warn('Could not clean up orphaned media', {
        context: 'PostCaptionAndTagPage',
        data: { mediaFileId, message: String(error) },
      });
    });
  }

  async publish(): Promise<void> {
    clearServerFieldErrors(this.form);

    if (this.isPublishing()) {
      return;
    }
    if (!this.postCreation.hasSelectedImage()) {
      return;
    }

    this.isPublishing.set(true);
    this.uploadProgress.set(0);

    try {
      const result = await this.postPublish.publish({
        imageSrc: this.selectedImageSrc(),
        filterCss: this.effectiveFilter(),
        transformCss: this.effectiveTransform(),
        content: this.buildContent(),
        pendingMediaId: this.postCreation.pendingMediaId(),
        onUploadProgress: (percent) => this.uploadProgress.set(percent),
      });

      this.publishedSuccessfully = true;

      // Optimistic insert: the API has no read endpoint yet.
      this.feed.prependPost(
        toFeedPost(
          result.post,
          this.auth.currentUser(),
          this.selectedImageSrc()
        )
      );

      this.postCreation.reset();
      await this.notification.showSuccess('Post published');
      await this.router.navigate(['/tabs/home'], { replaceUrl: true });
    } catch (error) {
      this.logger.error('Failed to publish post', {
        context: 'PostCaptionAndTagPage',
        data: { message: String(error) },
      });

      if (error instanceof PostPublishError && error.uploadedMediaId) {
        // Retry reuses the same media instead of uploading again.
        this.postCreation.setPendingMediaId(error.uploadedMediaId);
      }

      handleInlineFormError({
        error,
        form: this.form,
        context: 'publish',
        facade: this.postErrorFacade,
      });
    } finally {
      this.isPublishing.set(false);
    }
  }

  /** Caption + tags as hashtags, all inside `content` (API v1 contract). */
  private buildContent(): string | null {
    const { caption, tags } = this.form.getRawValue();
    const parts = [caption.trim(), ...this.normalizeTags(tags)].filter(
      (part) => part.length > 0
    );
    return parts.length > 0 ? parts.join(' ') : null;
  }

  private normalizeTags(raw: string): string[] {
    const seen = new Set<string>();
    return raw
      .split(/[\s,]+/)
      .map((tag) =>
        tag
          .trim()
          .replace(/^#+/, '')
          .replace(/[^\p{L}\p{N}_]/gu, '')
      )
      .filter((tag) => {
        if (!tag) return false;
        const key = tag.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((tag) => `#${tag}`);
  }
}
