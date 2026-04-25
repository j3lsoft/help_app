import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonIcon,
  IonInput,
  IonText,
  NavController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { eyeOffOutline, eyeOutline } from 'ionicons/icons';
import { catchError, EMPTY, finalize, tap } from 'rxjs';
import {
  AppError,
  ServerValidationErrorItem,
} from 'src/app/core/models/app-error.model';
import { LoggerService } from 'src/app/core/services/logger.service';
import { AppStorageService } from 'src/app/core/services/storage/app-storage.service';
import { STORAGE_KEYS } from 'src/app/core/services/storage/storage-keys';
import { handleInlineFormError } from 'src/app/core/utils/form-error-handler.utils';
import { clearServerFieldErrors } from 'src/app/core/utils/server-validation-errors.utils';
import { isInvalid } from 'src/app/shared/utils/form.utils';
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
import { AuthErrorFacade } from '../../errors/auth-error.facade';
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
  private readonly logger = inject(LoggerService);
  private readonly authErrorFacade = inject(AuthErrorFacade);

  showPassword = signal(false);
  showConfirmPwd = signal(false);
  isSubmitting = signal(false);

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
    return isInvalid(control);
  }

  async onSubmit(): Promise<void> {
    clearServerFieldErrors(this.form);

    if (this.isSubmitting()) {
      return;
    }

    if (!environment.apiBaseUrl) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const value = this.form.getRawValue();

    this.authApi
      .register({
        displayName: value.name.trim(),
        username: value.username.trim(),
        birthDate: value.birthDate,
        email: value.email.trim(),
        password: value.password,
      })
      .pipe(
        tap(async () => {
          await this.storage.setString(
            STORAGE_KEYS.pendingVerificationEmail,
            value.email.trim()
          );

          await this.router.navigate(['/auth/verification'], {
            queryParams: {
              email: value.email.trim(),
            },
          });
        }),
        catchError((error: AppError) => {
          this.logger.error('Register failed', {
            context: 'RegisterPage',
            data: { error: error.message },
          });
          handleInlineFormError({
            error,
            form: this.form,
            context: 'register',
            facade: this.authErrorFacade,
            validationOptions: {
              messageFormatter: ({ serverField, item }) =>
                this.getDynamicValidationMessage(serverField, item),
            },
          });
          return EMPTY;
        }),
        finalize(() => {
          this.isSubmitting.set(false);
        })
      )
      .subscribe();
  }

  private getDynamicValidationMessage(
    serverField: string,
    item: ServerValidationErrorItem
  ): string {
    if (serverField === 'birthDate') {
      const minAge = item.meta?.['minAge'];
      if (typeof minAge === 'number' && Number.isFinite(minAge) && minAge > 0) {
        return `You must be at least ${minAge} years old to register`;
      }
    }
    return item.message;
  }
}
