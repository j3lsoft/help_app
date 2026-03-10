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
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-verify-account',
  templateUrl: './verify-account.page.html',
  styleUrls: ['./verify-account.page.scss'],
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
export class VerifyAccountPage {
  private readonly navCtrl = inject(NavController);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly authApi = inject(AuthApiService);
  private readonly authService = inject(AuthService);
  private readonly storage = inject(AppStorageService);

  showLoadingDialog = signal(false);
  otpValue = signal('0');
  email = signal('');
  errorMessage = signal<string | null>(null);

  config: NgOtpInputConfig = {
    length: 6,
    allowNumbersOnly: true,
    inputClass: 'each_input',
    containerClass: 'otp-container',
  };

  constructor() {
    this.initEmail();
  }

  private async initEmail(): Promise<void> {
    const emailFromStorage =
      (await this.storage.getString(STORAGE_KEYS.pendingVerificationEmail)) ??
      '';
    const emailFromRoute = this.route.snapshot.queryParamMap.get('email') ?? '';
    this.email.set(emailFromRoute || emailFromStorage);
  }

  goBack(): void {
    this.navCtrl.back();
  }

  onContinue(): void {
    void this.verifyAndLogin();
  }

  onChange(event: string): void {
    this.otpValue.set(event);
    if (event.length === 6) {
      void this.verifyAndLogin();
    }
  }

  async onResend(): Promise<void> {
    this.errorMessage.set(null);
    if (!this.email()) {
      this.errorMessage.set('Please enter a valid email.');
      return;
    }

    this.showLoadingDialog.set(true);
    try {
      await firstValueFrom(
        this.authApi.resendVerification({ email: this.email() })
      );
    } catch (e) {
      this.errorMessage.set(this.mapVerifyError(e));
    } finally {
      this.showLoadingDialog.set(false);
    }
  }

  private async verifyAndLogin(): Promise<void> {
    if (this.showLoadingDialog()) {
      return;
    }

    this.errorMessage.set(null);
    const code = String(this.otpValue() ?? '').trim();
    if (!this.email() || code.length !== 6) {
      return;
    }

    this.showLoadingDialog.set(true);
    try {
      const response = await firstValueFrom(
        this.authApi.verifyEmail({ email: this.email(), code })
      );

      await this.authService.login(response);
      await this.storage.remove(STORAGE_KEYS.pendingVerificationEmail);
      this.showLoadingDialog.set(false);
      // Give the popover time to start the dismissal process before navigation
      setTimeout(async () => {
        await this.router.navigateByUrl('/bottom-tab-bar/home');
      }, 100);
    } catch (e) {
      this.errorMessage.set(this.mapVerifyError(e));
    } finally {
      this.showLoadingDialog.set(false);
    }
  }

  private mapVerifyError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 400) {
        return 'Invalid or expired code.';
      }
      if (error.status === 422) {
        return 'Validation failed.';
      }
      if (error.status === 401) {
        return 'Invalid credentials.';
      }
      if (error.status === 403) {
        return 'Email not verified or account locked.';
      }
      return 'Something went wrong. Please try again.';
    }
    if (error instanceof Error) {
      return error.message;
    }
    return 'Something went wrong. Please try again.';
  }
}
