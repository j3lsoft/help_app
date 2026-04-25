import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';
import {
  IonContent,
  IonIcon,
  IonInput,
  IonText,
} from '@ionic/angular/standalone';
import { BackHeaderComponent } from '@shared/components/back-header/back-header.component';
import { addIcons } from 'ionicons';
import { chevronBack, eyeOffOutline, eyeOutline } from 'ionicons/icons';
import { catchError, EMPTY, finalize, tap } from 'rxjs';
import { AppError } from 'src/app/core/models/app-error.model';
import { NotificationService } from 'src/app/core/services/notification.service';
import { handleInlineFormError } from 'src/app/core/utils/form-error-handler.utils';
import { clearServerFieldErrors } from 'src/app/core/utils/server-validation-errors.utils';
import { AuthErrorFacade } from 'src/app/features/auth/errors/auth-error.facade';
import { AuthApiService } from 'src/app/features/auth/services/auth-api.service';
import { isInvalid } from 'src/app/shared/utils/form.utils';
import {
  matchPasswordsValidator,
  passwordStrengthValidator,
} from 'src/app/shared/validators/password.validators';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.page.html',
  styleUrls: ['./change-password.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonContent,
    IonIcon,
    IonText,
    IonInput,
    ReactiveFormsModule,
    BackHeaderComponent,
  ],
})
export class ChangePasswordPage {
  private readonly navCtrl = inject(NavController);
  private readonly fb = inject(FormBuilder);
  private readonly authApi = inject(AuthApiService);
  private readonly notifications = inject(NotificationService);
  private readonly authErrorFacade = inject(AuthErrorFacade);

  isSubmitting = signal(false);

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
    clearServerFieldErrors(this.form);

    if (this.isSubmitting()) {
      return;
    }

    void this.changePassword();
  }

  private async changePassword(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const value = this.form.getRawValue();

    this.authApi
      .changePassword({
        currentPassword: value.currentPassword,
        newPassword: value.newPassword,
      })
      .pipe(
        tap(() => {
          void this.notifications.showSuccess(
            'Password updated successfully.',
            2000
          );
          this.form.reset();
          this.goBack();
        }),
        catchError((error: AppError) => {
          handleInlineFormError({
            error,
            form: this.form,
            context: 'password-change',
            facade: this.authErrorFacade,
          });
          return EMPTY;
        }),
        finalize(() => {
          this.isSubmitting.set(false);
        })
      )
      .subscribe();
  }
}
