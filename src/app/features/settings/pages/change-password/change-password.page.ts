import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NavController, ToastController } from '@ionic/angular';
import {
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonText,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronBack, eyeOffOutline, eyeOutline } from 'ionicons/icons';
import { firstValueFrom } from 'rxjs';
import { matchPasswordsValidator, passwordStrengthValidator } from 'src/app/shared/validators/password.validators';
import { isInvalid } from 'src/app/shared/utils/form.utils';
import { AuthErrorMapper } from 'src/app/features/auth/errors/auth-error-mapper';
import { AuthApiService } from 'src/app/features/auth/services/auth-api.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.page.html',
  styleUrls: ['./change-password.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonHeader,
    IonToolbar,
    IonContent,
    IonIcon,
    IonText,
    IonInput,
    ReactiveFormsModule,
  ],
})
export class ChangePasswordPage {
  private readonly navCtrl = inject(NavController);
  private readonly fb = inject(FormBuilder);
  private readonly authApi = inject(AuthApiService);
  private readonly toastCtrl = inject(ToastController);

  isSubmitting = signal(false);
  serverError = signal<string | null>(null);

  showCurrentPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);

  form = this.fb.group(
    {
      currentPassword: this.fb.nonNullable.control('', [Validators.required]),
      newPassword: this.fb.nonNullable.control('', [
        Validators.required,
        Validators.minLength(8),
        passwordStrengthValidator(),
      ]),
      confirmPassword: this.fb.nonNullable.control('', [Validators.required]),
    },
    {
      validators: [matchPasswordsValidator('newPassword', 'confirmPassword')],
    }
  );

  constructor() {
    addIcons({
      chevronBack,
      eyeOutline,
      eyeOffOutline,
    });
  }

  goBack(): void {
    this.navCtrl.back();
  }

  isInvalid = (
    controlName: keyof ChangePasswordPage['form']['controls']
  ): boolean => {
    const control = this.form.controls[controlName];
    return isInvalid(control);
  };

  onSubmit(): void {
    void this.changePassword();
  }

  private async changePassword(): Promise<void> {
    this.serverError.set(null);

    if (this.isSubmitting()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const value = this.form.getRawValue();

    try {
      await firstValueFrom(
        this.authApi.changePassword({
          currentPassword: value.currentPassword,
          newPassword: value.newPassword,
        })
      );

      const toast = await this.toastCtrl.create({
        message: 'Password updated successfully.',
        duration: 2000,
        position: 'bottom',
      });
      await toast.present();

      this.form.reset();
      this.goBack();
    } catch (e) {
      this.serverError.set(AuthErrorMapper.map(e, 'password-change'));
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
