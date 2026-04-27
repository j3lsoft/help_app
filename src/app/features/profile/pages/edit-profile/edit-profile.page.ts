import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  ViewChild,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { UploadStatus, UploadTask } from '@core/services/media/upload/models';
import { UploadFacade } from '@core/services/media/upload/services/upload-facade.service';
import { NotificationService } from '@core/services/notification.service';
import { toAppError } from '@core/utils/app-error.utils';
import { handleInlineFormError } from '@core/utils/form-error-handler.utils';
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
import { DEFAULT_PROFILE_IMAGE_PATH } from '../../constants/profile.constants';
import { ProfileErrorFacade } from '../../errors/profile-error.facade';
import { UserProfileFormData } from '../../models/profile-form.model';
import { UpdateProfileDto } from '../../models/update-profile.dto';
import { ProfileService } from '../../services/profile.service';
import { buildUpdatePayload } from '../../utils/profile-update.utils';
import { stripWebsiteProtocol } from '../../utils/website-url.utils';

interface ProfileFormState {
  initial: UserProfileFormData & { profileImage: string };
  current: UserProfileFormData & { profileImage: string };
}

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

  /** Access to form component for server error handling */
  @ViewChild(EditProfileFormComponent)
  private formComponent!: EditProfileFormComponent;

  /** Avoid overwriting the form if `currentUser` refreshes while editing. */
  private readonly hasInitialDataLoaded = signal(false);

  private readonly formState = signal<ProfileFormState>({
    initial: {
      displayName: '',
      username: '',
      bio: '',
      website: '',
      birthDate: '',
      profileImage: DEFAULT_PROFILE_IMAGE_PATH,
    },
    current: {
      displayName: '',
      username: '',
      bio: '',
      website: '',
      birthDate: '',
      profileImage: DEFAULT_PROFILE_IMAGE_PATH,
    },
  });

  // Exposed read-only signals for template
  initialProfile = computed(() => this.formState().initial);
  userProfile = computed(() => this.formState().current);

  isLoading = signal(false);
  hasUnsavedChanges = computed(() => {
    const { initial, current } = this.formState();
    return JSON.stringify(initial) !== JSON.stringify(current);
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
        profileImage: source.avatarUrl ?? DEFAULT_PROFILE_IMAGE_PATH,
      };
      this.formState.set({ initial: profileData, current: profileData });
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
    this.formState.update((state) => ({
      ...state,
      current: { ...state.current, ...formData },
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

    // Clear server errors before submitting (best practice per error-handling.md)
    this.formComponent?.clearServerErrors();

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
      const appError = toAppError(error);
      handleInlineFormError({
        error: appError,
        form: this.formComponent.getForm(),
        context: 'update-profile',
        facade: this.profileErrorFacade,
        validationOptions: {
          controlNameByServerField: { email: 'username' }, // adjust if needed
        },
      });
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
    this.formState.update((state) => ({
      ...state,
      current: { ...state.current, profileImage: newImageUrl },
    }));
  }

  onImageRemoved() {
    this.formState.update((state) => ({
      ...state,
      current: { ...state.current, profileImage: DEFAULT_PROFILE_IMAGE_PATH },
    }));
  }
}
