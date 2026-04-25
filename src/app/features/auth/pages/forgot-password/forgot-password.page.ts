import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { IonContent, IonInput, IonText } from '@ionic/angular/standalone';
import { catchError, EMPTY, finalize, tap } from 'rxjs';
import { AppError } from 'src/app/core/models/app-error.model';
import { AppStorageService } from 'src/app/core/services/storage/app-storage.service';
import { STORAGE_KEYS } from 'src/app/core/services/storage/storage-keys';
import { isInvalid } from 'src/app/shared/utils/form.utils';
import { AuthHeaderComponent } from '../../components/auth-header/auth-header.component';
import { AuthPrimaryButtonComponent } from '../../components/auth-primary-button/auth-primary-button.component';
import { AuthErrorFacade } from '../../errors/auth-error.facade';
import { AuthApiService } from '../../services/auth-api.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonContent,
    IonText,
    IonInput,
    ReactiveFormsModule,
    AuthHeaderComponent,
    AuthPrimaryButtonComponent,
  ],
})
export class ForgotPasswordPage {
  private readonly navCtrl = inject(NavController);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly authApi = inject(AuthApiService);
  private readonly storage = inject(AppStorageService);
  private readonly authErrorFacade = inject(AuthErrorFacade);

  isSubmitting = signal(false);

  form = this.fb.group({
    email: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.email,
    ]),
  });

  goBack(): void {
    this.navCtrl.back();
  }

  isInvalid = (
    controlName: keyof ForgotPasswordPage['form']['controls']
  ): boolean => {
    const control = this.form.controls[controlName];
    return isInvalid(control);
  };

  async onSubmit(): Promise<void> {
    if (this.isSubmitting()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const email = this.form.controls.email.value.trim();

    this.authApi
      .requestPasswordReset({ email })
      .pipe(
        tap(async () => {
          await this.storage.setString(
            STORAGE_KEYS.pendingPasswordResetEmail,
            email
          );

          await this.router.navigate(['/auth/verify-reset-otp'], {
            queryParams: { email },
          });
        }),
        catchError((error: AppError) => {
          this.authErrorFacade.handle(error, 'password-reset');
          return EMPTY;
        }),
        finalize(() => {
          this.isSubmitting.set(false);
        })
      )
      .subscribe();
  }
}
