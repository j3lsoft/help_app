import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  IonContent,
  IonIcon,
  IonInput,
  IonText,
} from '@ionic/angular/standalone';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { addIcons } from 'ionicons';
import { eyeOffOutline, eyeOutline } from 'ionicons/icons';
import { AuthHeaderComponent } from '../../components/auth-header/auth-header.component';
import { AuthPrimaryButtonComponent } from '../../components/auth-primary-button/auth-primary-button.component';
import { AuthSocialButtonsComponent } from '../../components/auth-social-buttons/auth-social-buttons.component';
import { AuthApiService } from '../../services/auth-api.service';
import { AuthService } from '../../services/auth.service';
import { firstValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';

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

  showPassword = signal(false);
  isSubmitting = signal(false);
  serverError = signal<string | null>(null);

  form = this.fb.group({
    emailOrUsername: this.fb.nonNullable.control('', [Validators.required]),
    password: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.minLength(8),
    ]),
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
      await this.router.navigateByUrl('/bottom-tab-bar/home');
    } catch (e) {
      this.serverError.set(this.mapLoginError(e));
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private mapLoginError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401) {
        return 'Invalid email or password.';
      }
      if (error.status === 403) {
        return 'Please verify your email before logging in.';
      }
      return 'Something went wrong. Please try again.';
    }
    return 'Something went wrong. Please try again.';
  }
}
