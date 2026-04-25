import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnDestroy,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import {
  AlertController,
  IonContent,
  LoadingController,
  NavController,
  ToastController,
} from '@ionic/angular/standalone';
import { BackHeaderComponent } from '@shared/components/back-header/back-header.component';
import { addIcons } from 'ionicons';
import { checkmarkCircle, chevronBack } from 'ionicons/icons';
import {
  Subject,
  filter,
  firstValueFrom,
  from,
  map,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs';
import { AppError } from 'src/app/core/models/app-error.model';
import { LoggerService } from 'src/app/core/services/logger.service';
import {
  UploadStatus,
  UploadTask,
} from 'src/app/core/services/media/upload/models';
import { UploadFacade } from 'src/app/core/services/media/upload/services/upload-facade.service';
import { toAppError } from 'src/app/core/utils/app-error.utils';
import { isServerValidationError } from 'src/app/core/utils/server-validation-errors.utils';
import { AuthService } from 'src/app/features/auth/services/auth.service';
import { dataUrlToFile } from 'src/app/shared/utils/file.utils';
import { EditProfileAvatarComponent } from '../../components/edit-profile-avatar/edit-profile-avatar.component';
import { EditProfileFormComponent } from '../../components/edit-profile-form/edit-profile-form.component';
import { DEFAULT_PROFILE_IMAGE_PATH } from '../../constants/profile.constants';
import { ProfileErrorFacade } from '../../errors/profile-error.facade';
import { UserProfileFormData } from '../../models/profile-form.model';
import { UpdateProfileDto } from '../../models/update-profile.dto';
import { ProfileService } from '../../services/profile.service';
import { buildUpdatePayload } from '../../utils/profile-update.utils';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
  imports: [
    CommonModule,
    IonContent,
    BackHeaderComponent,
    EditProfileAvatarComponent,
    EditProfileFormComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditProfilePage implements OnDestroy {
  private readonly navCtrl = inject(NavController);
  private readonly authService = inject(AuthService);
  private readonly profileService = inject(ProfileService);
  private readonly logger = inject(LoggerService);
  private readonly toastController = inject(ToastController);
  private readonly loadingController = inject(LoadingController);
  private readonly alertController = inject(AlertController);
  private readonly uploadFacade = inject(UploadFacade);
  private readonly injector = inject(Injector);
  private readonly profileErrorFacade = inject(ProfileErrorFacade);
  private readonly destroy$ = new Subject<void>();

  /** Avoid overwriting the form if `currentUser` refreshes while editing. */
  private readonly hasInitialDataLoaded = signal(false);

  serverError = signal<AppError | null>(null);
  formErrorMessage = signal<string | null>(null);

  initialProfile = signal<UserProfileFormData & { profileImage: string }>({
    displayName: '',
    username: '',
    bio: '',
    birthDate: '',
    profileImage: DEFAULT_PROFILE_IMAGE_PATH,
  });

  userProfile = signal<UserProfileFormData & { profileImage: string }>({
    displayName: '',
    username: '',
    bio: '',
    birthDate: '',
    profileImage: DEFAULT_PROFILE_IMAGE_PATH,
  });

  isLoading = signal(false);
  hasUnsavedChanges = computed(() => {
    const initial = this.initialProfile();
    const current = this.userProfile();

    return (
      current.displayName !== initial.displayName ||
      current.username !== initial.username ||
      current.bio !== initial.bio ||
      current.birthDate !== initial.birthDate ||
      current.profileImage !== initial.profileImage
    );
  });

  constructor() {
    addIcons({ chevronBack, checkmarkCircle });

    if (!this.authService.currentUser()) {
      this.authService.fetchUserProfile();
    }

    effect(() => {
      const user = this.authService.currentUser();
      if (!user || this.hasInitialDataLoaded()) {
        return;
      }
      const profileData = {
        displayName: user.displayName ?? '',
        username: user.username ?? '',
        email: user.email,
        bio: user.bio ?? '',
        birthDate: user.birthDate
          ? new Date(user.birthDate).toISOString().split('T')[0]
          : '',
        profileImage: user.avatarUrl ?? DEFAULT_PROFILE_IMAGE_PATH,
      };
      this.initialProfile.set(profileData);
      this.userProfile.set(profileData);
      this.hasInitialDataLoaded.set(true);
    });
  }

  onFormChanges(formData: UserProfileFormData) {
    this.userProfile.update((profile) => ({
      ...profile,
      ...formData,
    }));
  }

  goBack() {
    if (this.hasUnsavedChanges()) {
      this.showDiscardConfirmation();
    } else {
      this.navCtrl.back();
    }
  }

  private async showDiscardConfirmation() {
    const alert = await this.alertController.create({
      header: 'Discard changes?',
      message: 'You have unsaved changes. Are you sure you want to leave?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Discard',
          role: 'destructive',
          handler: () => this.navCtrl.back(),
        },
      ],
    });
    await alert.present();
  }

  async onProfileUpdate(formData: UserProfileFormData) {
    this.isLoading.set(true);

    const loading = await this.showLoadingIndicator();

    try {
      const resolvedAvatar = await this.resolveAvatarUrl();
      const updateDto = buildUpdatePayload(
        formData,
        this.initialProfile(),
        this.userProfile().profileImage,
        resolvedAvatar
      );

      if (Object.keys(updateDto).length === 0) {
        this.navCtrl.back();
        return;
      }

      await this.performProfileUpdate(updateDto);
      await this.showSuccessToast('Profile updated successfully');
      this.navCtrl.back();
    } catch (error) {
      this.handleProfileUpdateError(error);
    } finally {
      this.isLoading.set(false);
      await loading?.dismiss();
    }
  }

  private async showLoadingIndicator() {
    return await this.loadingController.create({
      message: 'Updating profile...',
    });
  }

  private async resolveAvatarUrl(): Promise<string> {
    const currentAvatar = this.userProfile().profileImage;

    if (!currentAvatar.startsWith('data:')) {
      return currentAvatar;
    }

    return new Promise((resolve, reject) => {
      from(dataUrlToFile(currentAvatar, `avatar_${Date.now()}.jpg`))
        .pipe(
          takeUntil(this.destroy$),
          tap(() => this.uploadFacade.setUploadType('avatar')),
          map((file) => this.uploadFacade.addFile(file)),
          switchMap((taskId) => {
            if (!taskId) throw new Error('Failed to start avatar upload');

            return toObservable(this.uploadFacade.queue, {
              injector: this.injector,
            }).pipe(
              map((queue) => queue.find((t) => t.id === taskId)),
              filter(
                (task): task is UploadTask =>
                  !!task &&
                  (task.status === UploadStatus.COMPLETED ||
                    task.status === UploadStatus.FAILED)
              ),
              take(1),
              takeUntil(this.destroy$),
              map((task) => {
                if (task.status === UploadStatus.FAILED) {
                  throw new Error(task.error?.message || 'Upload failed');
                }
                return task.result?.publicUrl || '';
              })
            );
          })
        )
        .subscribe({
          next: resolve,
          error: reject,
        });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async performProfileUpdate(
    updateDto: UpdateProfileDto
  ): Promise<void> {
    await firstValueFrom(this.profileService.updateProfile(updateDto));
  }

  private handleProfileUpdateError(error: unknown): void {
    const appError = toAppError(error);
    this.logger.error('Profile update failed', {
      context: 'EditProfilePage',
      data: { error: appError },
    });

    if (appError.handled) {
      return;
    }

    if (
      isServerValidationError(appError) ||
      this.isUsernameConflict(appError)
    ) {
      return;
    }

    this.profileErrorFacade.handle(appError, 'update-profile');
  }

  private isUsernameConflict(error: AppError): boolean {
    return (
      error.code === 'USERNAME_ALREADY_EXISTS' ||
      error.code === 'USERNAME_CONFLICT' ||
      error.status === 409
    );
  }

  onImageChanged(newImageUrl: string) {
    this.userProfile.update((profile) => ({
      ...profile,
      profileImage: newImageUrl,
    }));
  }

  onImageRemoved() {
    this.userProfile.update((profile) => ({
      ...profile,
      profileImage: DEFAULT_PROFILE_IMAGE_PATH,
    }));
  }

  private async showSuccessToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      icon: checkmarkCircle,
      color: 'success',
      position: 'bottom',
    });
    await toast.present();
  }
}
