import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, PopoverController } from '@ionic/angular';
import {
  IonContent,
  IonHeader,
  IonIcon,
  IonPopover,
  IonSpinner,
  IonText,
  IonToolbar,
} from '@ionic/angular/standalone';
import { NgOtpInputConfig, NgOtpInputModule } from 'ng-otp-input';
import { firstValueFrom } from 'rxjs';
import { AuthApiService } from '../../services/auth-api.service';
import { AppStorageService } from 'src/app/core/services/storage/app-storage.service';
import { STORAGE_KEYS } from 'src/app/core/services/storage/storage-keys';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthHeaderComponent } from '../../components/auth-header/auth-header.component';
import { AuthPrimaryButtonComponent } from '../../components/auth-primary-button/auth-primary-button.component';

@Component({
  selector: 'app-verify-account',
  templateUrl: './verify-account.page.html',
  styleUrls: ['./verify-account.page.scss'],
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
export class VerifyAccountPage implements OnInit {
  private readonly navCtrl = inject(NavController);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly popCtrl = inject(PopoverController);
  private readonly authApi = inject(AuthApiService);
  private readonly storage = inject(AppStorageService);

  showLoadingDialog = false;
  otpValue = '0';
  email = '';
  errorMessage: string | null = null;

  config: NgOtpInputConfig = {
    length: 6,
    allowNumbersOnly: true,
    inputClass: 'each_input',
    containerClass: 'otp-container',
  };

  async ngOnInit(): Promise<void> {
    const emailFromStorage =
      (await this.storage.getString(STORAGE_KEYS.pendingVerificationEmail)) ??
      '';
    this.email =
      this.route.snapshot.queryParamMap.get('email') ?? emailFromStorage;
  }

  goBack(): void {
    this.navCtrl.back();
  }

  onContinue(): void {
    void this.verifyAndLogin();
  }

  onChange(event: any): void {
    this.otpValue = event;
    if (event.length === 6) {
      void this.verifyAndLogin();
    }
  }

  async onResend(): Promise<void> {
    this.errorMessage = null;
    if (!this.email) {
      this.errorMessage = 'Please enter a valid email.';
      return;
    }

    this.showLoadingDialog = true;
    try {
      await firstValueFrom(
        this.authApi.resendVerification({ email: this.email })
      );
    } catch (e) {
      this.errorMessage = this.mapVerifyError(e);
    } finally {
      this.showLoadingDialog = false;
      this.popCtrl.dismiss();
    }
  }

  private async verifyAndLogin(): Promise<void> {
    if (this.showLoadingDialog) {
      return;
    }

    this.errorMessage = null;
    const code = String(this.otpValue ?? '').trim();
    if (!this.email || code.length !== 6) {
      return;
    }

    this.showLoadingDialog = true;
    try {
      const response = await firstValueFrom(
        this.authApi.verifyEmail({ email: this.email, code })
      );

      await this.storage.setString(
        STORAGE_KEYS.accessToken,
        response.accessToken
      );

      await this.router.navigateByUrl('/bottom-tab-bar/home');
    } catch (e) {
      this.errorMessage = this.mapVerifyError(e);
    } finally {
      this.showLoadingDialog = false;
      this.popCtrl.dismiss();
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
