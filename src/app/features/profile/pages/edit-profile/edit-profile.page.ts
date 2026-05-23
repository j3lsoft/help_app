import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  computed,
  effect,
  inject,
  linkedSignal,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { UploadStatus, UploadTask } from '@core/services/media/upload/models';
import { UploadFacade } from '@core/services/media/upload/services/upload-facade.service';
import { NotificationService } from '@core/services/notification.service';
import { toAppError } from '@core/utils/app-error.utils';
import { handleInlineFormError } from '@core/utils/form-error-handler.utils';
import { clearServerFieldErrors } from '@core/utils/server-validation-errors.utils';
import { AuthService } from '@features/auth/services/auth.service';
import {
  AlertController,
  IonContent,
  LoadingController,
  NavController,
} from '@ionic/angular/standalone';
import { BackHeaderComponent } from '@shared/components/back-header/back-header.component';
import { dataUrlToFile } from '@shared/utils/file.utils';
import { addIcons } from 'ionicons';
import { checkmarkCircle, chevronBack } from 'ionicons/icons';
import { filter, firstValueFrom, from, map, switchMap, take, tap } from 'rxjs';
import { EditProfileAvatarComponent } from '../../components/edit-profile-avatar/edit-profile-avatar.component';
import { EditProfileFormComponent } from '../../components/edit-profile-form/edit-profile-form.component';
import { ProfileErrorFacade } from '../../errors/profile-error.facade';
import { UserProfileFormData } from '../../models/profile-form.model';
import { UpdateProfileDto } from '../../models/update-profile.dto';
import { ProfileService } from '../../services/profile.service';
import { buildUpdatePayload } from '../../utils/profile-update.utils';
import { stripWebsiteProtocol } from '../../utils/website-url.utils';

type ProfileFormData = UserProfileFormData & { profileImage: string };

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
export class EditProfilePage {
  private readonly navCtrl = inject(NavController);
  private readonly authService = inject(AuthService);
  private readonly profileService = inject(ProfileService);
  private readonly notification = inject(NotificationService);
  private readonly loadingController = inject(LoadingController);
  private readonly alertController = inject(AlertController);
  private readonly uploadFacade = inject(UploadFacade);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly profileErrorFacade = inject(ProfileErrorFacade);

  private readonly defaultProfile: ProfileFormData = {
    displayName: '',
    username: '',
    bio: '',
    website: '',
    birthDate: '',
    profileImage: '',
  };

  /** Avoid overwriting the form if `currentUser` refreshes while editing. */
  private readonly hasInitialDataLoaded = signal(false);

  // Access to form component for server error handling
  private readonly formComponent = viewChild(EditProfileFormComponent);

  // Initial profile data - source of truth for detecting changes
  initialProfile = signal<ProfileFormData>(this.defaultProfile);

  // Current profile data - linked to initial, but can diverge when user edits
  userProfile = linkedSignal(() => this.initialProfile());

  isLoading = signal(false);

  hasUnsavedChanges = computed(() => {
    const initial = this.initialProfile();
    const current = this.userProfile();
    return (
      initial.displayName !== current.displayName ||
      initial.username !== current.username ||
      initial.bio !== current.bio ||
      initial.website !== current.website ||
      initial.birthDate !== current.birthDate ||
      initial.profileImage !== current.profileImage
    );
  });

  constructor() {
    addIcons({ chevronBack, checkmarkCircle });

    // Load full profile data (includes bio, website, birthDate)
    this.loadProfileData();

    effect(() => {
      const profile = this.profileService.currentProfile();
      const authUser = this.authService.currentUser();

      // Need at least auth user to proceed
      if (!authUser || this.hasInitialDataLoaded()) {
        return;
      }

      // Use full profile if available, otherwise auth user (profile still loading)
      const source = profile ?? authUser;

      const profileData = {
        displayName: source.displayName ?? '',
        username: source.username ?? '',
        bio: profile?.bio ?? '',
        website: stripWebsiteProtocol(profile?.website ?? ''),
        birthDate: profile?.birthDate
          ? new Date(profile.birthDate).toISOString().split('T')[0]
          : '',
        profileImage: source.avatarUrl ?? '',
      };
      this.initialProfile.set(profileData);
      this.hasInitialDataLoaded.set(true);
    });
  }

  private async loadProfileData(): Promise<void> {
    // Fetch full profile if not cached
    if (!this.profileService.hasCachedProfile()) {
      try {
        await firstValueFrom(this.profileService.getMyProfile());
      } catch (error) {
        // Error already logged by ProfileService/Interceptor
      }
    }
  }

  onFormChanges(formData: UserProfileFormData) {
    this.userProfile.update((current) => ({ ...current, ...formData }));
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

    // Clear server errors before submitting (best practice per error-handling.md)
    const form = this.formComponent()?.getForm();
    if (form) {
      clearServerFieldErrors(form);
      this.formComponent()?.clearServerErrors();
    }

    const loading = await this.showLoadingIndicator();

    try {
      const resolvedAvatar = await this.resolveAvatarUrl();
      const updateDto = buildUpdatePayload({
        formData,
        initialData: this.initialProfile(),
        currentImage: this.userProfile().profileImage,
        resolvedAvatar,
      });

      if (Object.keys(updateDto).length === 0) {
        this.navCtrl.back();
        return;
      }

      await this.performProfileUpdate(updateDto);
      await this.notification.showSuccess('Profile updated successfully');
      this.navCtrl.back();
    } catch (error) {
      const form = this.formComponent()?.getForm();
      if (form) {
        handleInlineFormError({
          error,
          form,
          context: 'update-profile',
          facade: this.profileErrorFacade,
          validationOptions: {
            controlNameByServerField: { email: 'username' }, // adjust if needed
          },
        });
      }
    } finally {
      this.isLoading.set(false);
      await loading?.dismiss();
    }
  }

  private async showLoadingIndicator() {
    const loading = await this.loadingController.create({
      message: 'Updating profile...',
    });
    await loading.present();
    return loading;
  }

  private async resolveAvatarUrl(): Promise<string> {
    const currentAvatar = this.userProfile().profileImage;

    if (!currentAvatar.startsWith('data:')) {
      return currentAvatar;
    }

    return new Promise((resolve, reject) => {
      from(dataUrlToFile(currentAvatar, `avatar_${Date.now()}.jpg`))
        .pipe(
          takeUntilDestroyed(this.destroyRef),
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
              takeUntilDestroyed(this.destroyRef),
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

  private async performProfileUpdate(
    updateDto: UpdateProfileDto
  ): Promise<void> {
    await firstValueFrom(this.profileService.updateProfile(updateDto));
  }

  onImageChanged(newImageUrl: string) {
    this.userProfile.update((current) => ({ ...current, profileImage: newImageUrl }));
  }

  onImageRemoved() {
    this.userProfile.update((current) => ({ ...current, profileImage: "" }));
  }
}
