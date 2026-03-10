import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import {
  IonContent,
  IonIcon,
  IonInput,
  IonText,
} from '@ionic/angular/standalone';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AppStorageService } from 'src/app/core/services/storage/app-storage.service';
import { AuthApiService } from '../../services/auth-api.service';
import { firstValueFrom } from 'rxjs';
import { STORAGE_KEYS } from 'src/app/core/services/storage/storage-keys';
import { addIcons } from 'ionicons';
import { eyeOffOutline, eyeOutline } from 'ionicons/icons';
import { AuthHeaderComponent } from '../../components/auth-header/auth-header.component';
import { AuthPrimaryButtonComponent } from '../../components/auth-primary-button/auth-primary-button.component';
import { AuthSocialButtonsComponent } from '../../components/auth-social-buttons/auth-social-buttons.component';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonIcon,
    IonText,
    IonContent,
    IonInput,
    ReactiveFormsModule,
    AuthHeaderComponent,
    AuthPrimaryButtonComponent,
    AuthSocialButtonsComponent,
  ],
})
export class RegisterPage {
  private readonly navCtrl = inject(NavController);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly authApi = inject(AuthApiService);
  private readonly storage = inject(AppStorageService);

  showPassword = signal(false);
  showConfirmPwd = signal(false);
  isSubmitting = signal(false);
  serverError = signal<string | null>(null);

  form = this.fb.group(
    {
      name: this.fb.nonNullable.control('', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
      ]),
      username: this.fb.nonNullable.control('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(30),
        usernameValidator(),
      ]),
      birthDate: this.fb.nonNullable.control('', [
        Validators.required,
        birthDateMinAgeValidator(() => environment.minAgeYears),
      ]),
      email: this.fb.nonNullable.control('', [
        Validators.required,
        Validators.email,
      ]),
      password: this.fb.nonNullable.control('', [
        Validators.required,
        Validators.minLength(8),
        passwordStrengthValidator(),
      ]),
      confirmPassword: this.fb.nonNullable.control('', [Validators.required]),
    },
    {
      validators: [matchPasswordsValidator('password', 'confirmPassword')],
    }
  );

  constructor() {
    addIcons({
      eyeOffOutline,
      eyeOutline,
    });
  }

  goBack(): void {
    this.navCtrl.back();
  }

  goTo(screen: any): void {
    this.router.navigateByUrl(screen);
  }

  isInvalid(controlName: keyof RegisterPage['form']['controls']): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  async onSubmit(): Promise<void> {
    this.serverError.set(null);
    if (this.isSubmitting()) {
      return;
    }

    if (!environment.apiBaseUrl) {
      this.serverError.set(
        'API base URL is not configured. Please set environment.apiBaseUrl.'
      );
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
        this.authApi.register({
          name: value.name.trim(),
          username: value.username.trim(),
          birthDate: value.birthDate,
          email: value.email.trim(),
          password: value.password,
        })
      );

      await this.storage.setString(
        STORAGE_KEYS.pendingVerificationEmail,
        value.email.trim()
      );

      await this.router.navigate(['/auth/verification'], {
        queryParams: {
          email: value.email.trim(),
        },
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Register error', e);
      this.serverError.set(this.mapRegisterError(e));
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private mapRegisterError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'Network error. Check API base URL and CORS settings.';
      }
      if (error.status === 409) {
        const msg =
          typeof error.error?.message === 'string' ? error.error.message : '';
        const lower = msg.toLowerCase();
        if (lower.includes('username')) {
          return 'The username is not available';
        }
        if (lower.includes('email')) {
          return 'The email is already registered';
        }
        return 'Email or username already exists';
      }
      if (error.status === 400) {
        return 'Invalid data. Please review the form.';
      }

      const backendMessage =
        typeof error.error?.message === 'string' ? error.error.message : '';
      return backendMessage
        ? backendMessage
        : `Something went wrong. Please try again. (${error.status})`;
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

function usernameValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? '');
    if (!value) {
      return null;
    }
    if (!/^[a-zA-Z0-9._]+$/.test(value)) {
      return { usernameFormat: true };
    }
    if (value.startsWith('.') || value.endsWith('.')) {
      return { usernameDot: true };
    }
    if (value.includes('..')) {
      return { usernameDot: true };
    }
    return null;
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

function birthDateMinAgeValidator(getMinAgeYears: () => number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const minAgeYears = Number(getMinAgeYears() ?? 0);
    const value = String(control.value ?? '');
    if (!value || minAgeYears <= 0) {
      return null;
    }

    const birth = new Date(value);
    if (Number.isNaN(birth.getTime())) {
      return { invalidBirthDate: true };
    }

    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    const adjustedAge =
      m < 0 || (m === 0 && today.getDate() < birth.getDate()) ? age - 1 : age;
    return adjustedAge >= minAgeYears ? null : { underAge: true };
  };
}
