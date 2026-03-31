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
import { ActivatedRoute, Router } from '@angular/router';
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
import { NotificationService } from 'src/app/core/services/notification.service';
import { AppStorageService } from 'src/app/core/services/storage/app-storage.service';
import { STORAGE_KEYS } from 'src/app/core/services/storage/storage-keys';
import { matchPasswordsValidator, passwordStrengthValidator } from 'src/app/shared/validators/password.validators';
import { isInvalid } from 'src/app/shared/utils/form.utils';
import { AuthHeaderComponent } from '../../components/auth-header/auth-header.component';
import { AuthPrimaryButtonComponent } from '../../components/auth-primary-button/auth-primary-button.component';
import { AuthErrorMapper } from '../../errors/auth-error-mapper';
import { AuthApiService } from '../../services/auth-api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonIcon,
    IonContent,
    IonInput,
    IonText,
    ReactiveFormsModule,
    AuthHeaderComponent,
    AuthPrimaryButtonComponent,
  ],
})
export class ResetPasswordPage {
  private readonly navCtrl = inject(NavController);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly authApi = inject(AuthApiService);
  private readonly authService = inject(AuthService);
  private readonly storage = inject(AppStorageService);
  private readonly notification = inject(NotificationService);

  showLoadingDialog = signal(false);
  email = signal('');
  changePasswordToken = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  showNewPassword = signal(false);
  showConfirmPwd = signal(false);
  isSubmitting = signal(false);

  form = this.fb.group(
    {
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
    void this.initState();

    addIcons({
      eyeOffOutline,
      eyeOutline,
    });
  }

  private async initState(): Promise<void> {
    const emailFromRoute = this.route.snapshot.queryParamMap.get('email') ?? '';
    const emailFromStorage =
      (await this.storage.getString(STORAGE_KEYS.pendingPasswordResetEmail)) ??
      '';
    this.email.set(emailFromRoute || emailFromStorage);

    const tokenFromStorage =
      (await this.storage.getString(STORAGE_KEYS.pendingChangePasswordToken)) ??
      null;
    this.changePasswordToken.set(tokenFromStorage);

    if (!tokenFromStorage) {
      this.errorMessage.set('Please verify the code first.');
    }
  }

  goBack(): void {
    this.navCtrl.back();
  }

  isInvalid = (controlName: keyof ResetPasswordPage['form']['controls']): boolean => {
    const control = this.form.controls[controlName];
    return isInvalid(control);
  };

  onSubmit(): void {
    void this.changePassword();
  }

  private async changePassword(): Promise<void> {
    if (this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const token = this.changePasswordToken();
    if (!token) {
      this.errorMessage.set('Please verify the code first.');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    try {
      await firstValueFrom(
        this.authApi.changePasswordWithToken({
          changePasswordToken: token,
          newPassword: value.newPassword,
        })
      );

      await this.storage.remove(STORAGE_KEYS.pendingPasswordResetEmail);
      await this.storage.remove(STORAGE_KEYS.pendingChangePasswordToken);
      await this.authService.logout();

      await this.notification.showSuccess('Password updated successfully.');
      await this.router.navigateByUrl('/auth/sign-in', { replaceUrl: true });
    } catch (e) {
      this.errorMessage.set(AuthErrorMapper.map(e, 'password-change'));
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
