import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import {
  IonContent,
  IonPopover,
  IonSpinner,
  IonText,
} from '@ionic/angular/standalone';
import { NgOtpInputConfig, NgOtpInputModule } from 'ng-otp-input';
import { firstValueFrom } from 'rxjs';
import { AppStorageService } from 'src/app/core/services/storage/app-storage.service';
import { STORAGE_KEYS } from 'src/app/core/services/storage/storage-keys';
import { AuthHeaderComponent } from '../../components/auth-header/auth-header.component';
import { AuthPrimaryButtonComponent } from '../../components/auth-primary-button/auth-primary-button.component';
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

  showLoadingDialog = signal(false);
  otpValue = signal('');
  email = signal('');
  errorMessage = signal<string | null>(null);

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
    this.errorMessage.set(null);
    if (!this.email()) {
      this.errorMessage.set('Please enter a valid email.');
      return;
    }

    if (this.showLoadingDialog()) {
      return;
    }

    this.showLoadingDialog.set(true);
    try {
      await firstValueFrom(
        this.authApi.requestPasswordReset({ email: this.email() })
      );
      await this.storage.setString(
        STORAGE_KEYS.pendingPasswordResetEmail,
        this.email()
      );
    } catch (e) {
      this.errorMessage.set(this.mapVerifyOtpError(e));
    } finally {
      this.showLoadingDialog.set(false);
    }
  }

  private async verifyOtp(): Promise<void> {
    if (this.showLoadingDialog()) {
      return;
    }

    this.errorMessage.set(null);
    const otp = String(this.otpValue() ?? '').trim();
    if (!this.email() || otp.length !== 6) {
      this.errorMessage.set('Please enter the 6-digit code.');
      return;
    }

    this.showLoadingDialog.set(true);
    try {
      const response = await firstValueFrom(
        this.authApi.verifyPasswordResetOtp({ email: this.email(), otp })
      );

      await this.storage.setString(
        STORAGE_KEYS.pendingChangePasswordToken,
        response.changePasswordToken
      );

      this.showLoadingDialog.set(false);
      // Give the popover time to start the dismissal process before navigation
      setTimeout(async () => {
        await this.router.navigate(['/auth/reset-password'], {
          queryParams: { email: this.email() },
        });
      }, 100);
    } catch (e) {
      this.errorMessage.set(this.mapVerifyOtpError(e));
    } finally {
      this.showLoadingDialog.set(false);
    }
  }

  private mapVerifyOtpError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'Network error. Please try again.';
      }
      if (error.status === 400) {
        return 'Invalid or expired code.';
      }
      if (error.status === 422) {
        return 'Validation failed.';
      }
      if (error.status === 429) {
        return 'Too many requests. Please try again later.';
      }
      return 'Something went wrong. Please try again.';
    }
    return 'Something went wrong. Please try again.';
  }
}
