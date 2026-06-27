import { CommonModule, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnDestroy,
  output,
  signal,
} from '@angular/core';
import {
  CameraError,
  CameraService,
} from '@core/services/camera/camera.service';
import { LoggerService } from '@core/services/logger.service';
import { toAppError } from '@core/utils/app-error.utils';
import {
  IonIcon,
  IonModal,
  IonSpinner,
  IonText,
  Platform,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cameraOutline, imageOutline, trashOutline } from 'ionicons/icons';
import { ProfileErrorFacade } from '../../errors/profile-error.facade';
import { AppError } from '@core/models/app-error.model';
import {
  getUserInitials,
  isValidUserImage,
} from '@shared/utils/user-display.utils';

@Component({
  selector: 'app-edit-profile-avatar',
  templateUrl: './edit-profile-avatar.component.html',
  styleUrls: ['./edit-profile-avatar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonText, IonModal, IonIcon, IonSpinner, NgOptimizedImage],
})
export class EditProfileAvatarComponent implements OnDestroy {
  imageUrl = input.required<string>();
  name = input<string>('');
  imageChanged = output<string>();
  imageRemoved = output<void>();

  private platform = inject(Platform);
  private cameraService = inject(CameraService);
  private logger = inject(LoggerService);
  private profileErrorFacade = inject(ProfileErrorFacade);

  isLoading = signal(false);
  private modal: HTMLIonModalElement | null = null;

  hasValidImage = computed(() => isValidUserImage(this.imageUrl()));

  userInitials = computed(() => getUserInitials(this.name()));

  get isIos() {
    return this.platform.is('ios');
  }

  constructor() {
    addIcons({ cameraOutline, imageOutline, trashOutline });
  }

  async onTakePhoto() {
    await this.handleImageCapture('camera');
  }

  async onSelectFromGallery() {
    await this.handleImageCapture('gallery');
  }

  private async handleImageCapture(source: 'camera' | 'gallery') {
    if (this.isLoading()) {
      return;
    }

    this.isLoading.set(true);

    try {
      const result =
        source === 'camera'
          ? await this.cameraService.takePhoto({
              quality: 80,
              allowEditing: false,
            })
          : await this.cameraService.selectFromGallery({
              quality: 80,
              allowEditing: false,
            });

      this.imageChanged.emit(result.dataUrl);
      await this.closeModal();

      this.logger.debug('Image captured successfully', {
        context: 'EditProfileAvatarComponent',
        data: { source, format: result.format },
      });
    } catch (error) {
      await this.handleCameraError(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  private async handleCameraError(error: unknown) {
    let appError: AppError;

    if (error instanceof CameraError) {
      if (error.isPermissionDenied) {
        appError = { status: 403, code: 'PERMISSION_DENIED', handled: false };
      } else {
        appError = { status: 400, code: 'CAMERA_ERROR', message: error.message, handled: false };
      }
    } else {
      appError = toAppError(error);
    }

    this.profileErrorFacade.handle(appError, 'avatar-upload');
  }

  private async closeModal() {
    if (this.modal) {
      await this.modal.dismiss();
    }
  }

  onModalWillPresent(event: CustomEvent) {
    this.modal = event.target as HTMLIonModalElement;
  }

  ngOnDestroy(): void {
    this.modal = null;
  }

  async removeImage() {
    this.imageRemoved.emit();
    await this.closeModal();
  }
}
