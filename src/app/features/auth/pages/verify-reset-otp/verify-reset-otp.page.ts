import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppError } from '@core/models/app-error.model';
import { AppStorageService } from '@core/services/storage/app-storage.service';
import { STORAGE_KEYS } from '@core/services/storage/storage-keys';
import { NavController } from '@ionic/angular';
import {
  IonContent,
  IonPopover,
  IonSpinner,
  IonText,
} from '@ionic/angular/standalone';
import { NgOtpInputConfig, NgOtpInputModule } from 'ng-otp-input';
import { catchError, EMPTY, finalize, tap } from 'rxjs';
import { AuthHeaderComponent } from '../../components/auth-header/auth-header.component';
import { AuthPrimaryButtonComponent } from '../../components/auth-primary-button/auth-primary-button.component';
import { AuthErrorFacade } from '../../errors/auth-error.facade';
import { AuthApiService } from '../../services/auth-api.service';

@Component({
  selector: 'app-verify-reset-otp',
  templateUrl: './verify-reset-otp.page.html',
  styleUrls: ['./verify-reset-otp.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonContent,
    IonText,
    IonPopover,
    IonSpinner,
    NgOtpInputModule,
    AuthHeaderComponent,
    AuthPrimaryButtonComponent,
  ],
})
export class VerifyResetOtpPage {
  private readonly navCtrl = inject(NavController);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly authApi = inject(AuthApiService);
  private readonly storage = inject(AppStorageService);
  private readonly authErrorFacade = inject(AuthErrorFacade);

  showLoadingDialog = signal(false);
  otpValue = signal('');
  email = signal('');

  config: NgOtpInputConfig = {
    length: 6,
    allowNumbersOnly: true,
    inputClass: 'each_input',
    containerClass: 'otp-container',
  };

  constructor() {
    void this.initEmail();
  }

  private async initEmail(): Promise<void> {
    const emailFromRoute = this.route.snapshot.queryParamMap.get('email') ?? '';
    const emailFromStorage =
      (await this.storage.getString(STORAGE_KEYS.pendingPasswordResetEmail)) ??
      '';
    this.email.set(emailFromRoute || emailFromStorage);
  }

  goBack(): void {
    this.navCtrl.back();
  }

  onContinue(): void {
    void this.verifyOtp();
  }

  onChange(event: string): void {
    this.otpValue.set(event);
    if (event.length === 6) {
      void this.verifyOtp();
    }
  }

  async onResend(): Promise<void> {
    if (!this.email()) {
      return;
    }

    if (this.showLoadingDialog()) {
      return;
    }

    this.showLoadingDialog.set(true);
    this.authApi
      .requestPasswordReset({ email: this.email() })
      .pipe(
        tap(async () => {
          await this.storage.setString(
            STORAGE_KEYS.pendingPasswordResetEmail,
            this.email()
          );
        }),
        catchError((error: AppError) => {
          this.authErrorFacade.handle(error, 'password-reset');
          return EMPTY;
        }),
        finalize(() => {
          this.showLoadingDialog.set(false);
        })
      )
      .subscribe();
  }

  private async verifyOtp(): Promise<void> {
    if (this.showLoadingDialog()) {
      return;
    }

    const otp = String(this.otpValue() ?? '').trim();
    if (!this.email() || otp.length !== 6) {
      return;
    }

    this.showLoadingDialog.set(true);
    this.authApi
      .verifyPasswordResetOtp({ email: this.email(), otp })
      .pipe(
        tap(async (response) => {
          await this.storage.setString(
            STORAGE_KEYS.pendingChangePasswordToken,
            response.changePasswordToken
          );

          this.showLoadingDialog.set(false);
          setTimeout(async () => {
            await this.router.navigate(['/auth/reset-password'], {
              queryParams: { email: this.email() },
            });
          }, 100);
        }),
        catchError((error: AppError) => {
          this.authErrorFacade.handle(error, 'password-reset');
          return EMPTY;
        }),
        finalize(() => {
          this.showLoadingDialog.set(false);
        })
      )
      .subscribe();
  }
}
