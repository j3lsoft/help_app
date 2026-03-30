import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ViewWillEnter } from '@ionic/angular';
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
import { AuthHeaderComponent } from '../../components/auth-header/auth-header.component';
import { AuthPrimaryButtonComponent } from '../../components/auth-primary-button/auth-primary-button.component';
import { AuthSocialButtonsComponent } from '../../components/auth-social-buttons/auth-social-buttons.component';
import { AuthApiService } from '../../services/auth-api.service';
import { AuthService } from '../../services/auth.service';

function emailOrUsernameValidator(
  control: AbstractControl
): ValidationErrors | null {
  const value = control.value?.trim() || '';

  if (!value) return null;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;

  if (emailRegex.test(value) || usernameRegex.test(value)) {
    return null;
  }

  return { invalidEmailOrUsername: true };
}

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
  private readonly errorHandler = inject(ErrorHandlerService);

  showPassword = signal(false);
  isSubmitting = signal(false);
  serverError = signal<string | null>(null);

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
    return control.invalid && (control.dirty || control.touched);
  }

  async onSubmit(): Promise<void> {
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
      const response = await firstValueFrom(
        this.authApi.login({
          emailOrUsername: value.emailOrUsername.trim(),
          password: value.password,
        })
      );

      await this.authService.login(response);
      this.form.reset();
      await this.router.navigateByUrl('/tabs/home');
    } catch (e) {
      this.serverError.set(this.errorHandler.mapAuthError(e, 'login'));
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
