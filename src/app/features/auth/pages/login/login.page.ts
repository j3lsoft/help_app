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
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { eyeOffOutline, eyeOutline } from 'ionicons/icons';
import { catchError, EMPTY, finalize, tap } from 'rxjs';
import { AppError } from 'src/app/core/models/app-error.model';
import { handleInlineFormError } from 'src/app/core/utils/form-error-handler.utils';
import { clearServerFieldErrors } from 'src/app/core/utils/server-validation-errors.utils';
import { isInvalid } from 'src/app/shared/utils/form.utils';
import { emailOrUsernameValidator } from '../../../../shared/validators/identity.validators';
import { AuthHeaderComponent } from '../../components/auth-header/auth-header.component';
import { AuthPrimaryButtonComponent } from '../../components/auth-primary-button/auth-primary-button.component';
import { AuthSocialButtonsComponent } from '../../components/auth-social-buttons/auth-social-buttons.component';
import { AuthErrorFacade } from '../../errors/auth-error.facade';
import { AuthApiService } from '../../services/auth-api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonText,
    IonContent,
    IonInput,
    IonIcon,
    ReactiveFormsModule,
    AuthHeaderComponent,
    AuthPrimaryButtonComponent,
    AuthSocialButtonsComponent,
  ],
})
export class LoginPage {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly authApi = inject(AuthApiService);
  private readonly authService = inject(AuthService);
  private readonly authErrorFacade = inject(AuthErrorFacade);

  showPassword = signal(false);
  isSubmitting = signal(false);

  form = this.fb.group({
    emailOrUsername: this.fb.nonNullable.control('', [
      Validators.required,
      emailOrUsernameValidator,
    ]),
    password: this.fb.nonNullable.control('', [Validators.required]),
  });

  constructor() {
    addIcons({
      eyeOutline,
      eyeOffOutline,
    });
  }

  goTo(screen: string): void {
    this.router.navigateByUrl(screen);
  }

  isInvalid(controlName: keyof LoginPage['form']['controls']): boolean {
    const control = this.form.controls[controlName];
    return isInvalid(control);
  }

  async onSubmit(): Promise<void> {
    clearServerFieldErrors(this.form);

    if (this.isSubmitting()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const value = this.form.getRawValue();

    this.authApi
      .login({
        emailOrUsername: value.emailOrUsername.trim(),
        password: value.password,
      })
      .pipe(
        tap(async (response) => {
          await this.authService.login(response);
          this.form.reset();
          await this.router.navigateByUrl('/tabs/home');
        }),
        catchError((error: AppError) => {
          handleInlineFormError({
            error,
            form: this.form,
            context: 'login',
            facade: this.authErrorFacade,
            validationOptions: {
              controlNameByServerField: { email: 'emailOrUsername' },
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
}
