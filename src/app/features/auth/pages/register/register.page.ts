import {
    ChangeDetectionStrategy,
    Component,
    inject,
    signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import {
    IonContent,
    IonIcon,
    IonInput,
    IonText,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { eyeOffOutline, eyeOutline } from 'ionicons/icons';
import { firstValueFrom } from 'rxjs';
import { ErrorHandlerService } from 'src/app/core/services/error-handler.service';
import { AppStorageService } from 'src/app/core/services/storage/app-storage.service';
import { STORAGE_KEYS } from 'src/app/core/services/storage/storage-keys';
import { birthDateMinAgeValidator } from 'src/app/shared/validators/birth-date.validators';
import {
    matchPasswordsValidator,
    passwordStrengthValidator,
} from 'src/app/shared/validators/password.validators';
import { usernameValidator } from 'src/app/shared/validators/username.validators';
import { environment } from 'src/environments/environment';
import { AuthHeaderComponent } from '../../components/auth-header/auth-header.component';
import { AuthPrimaryButtonComponent } from '../../components/auth-primary-button/auth-primary-button.component';
import { AuthSocialButtonsComponent } from '../../components/auth-social-buttons/auth-social-buttons.component';
import { AuthApiService } from '../../services/auth-api.service';

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
  private readonly errorHandler = inject(ErrorHandlerService);

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
      this.serverError.set(this.errorHandler.mapAuthError(e, 'register'));
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
