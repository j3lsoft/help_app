import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
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

  isInvalid(
    controlName: keyof ChangePasswordPage['form']['controls']
  ): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

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
      this.serverError.set(this.mapError(e));
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private mapError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'Network error. Please try again.';
      }
      if (error.status === 400 || error.status === 401) {
        return 'Current password is incorrect.';
      }
      if (error.status === 422) {
        return 'Validation failed.';
      }
      return 'Something went wrong. Please try again.';
    }

    return 'Something went wrong. Please try again.';
  }
}

function matchPasswordsValidator(
  passwordKey: string,
  confirmKey: string
): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const password = group.get(passwordKey)?.value;
    const confirm = group.get(confirmKey)?.value;
    if (!password || !confirm) {
      return null;
    }
    return password === confirm ? null : { passwordsMismatch: true };
  };
}

function passwordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? '');
    if (!value) {
      return null;
    }
    const hasNumber = /\d/.test(value);
    const hasSpecial = /[^a-zA-Z0-9]/.test(value);
    return hasNumber && hasSpecial ? null : { weakPassword: true };
  };
}
