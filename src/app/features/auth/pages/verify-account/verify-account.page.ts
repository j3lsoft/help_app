import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent,
  IonPopover,
  IonSpinner,
  IonText,
  NavController,
} from '@ionic/angular/standalone';
import { NgOtpInputConfig, NgOtpInputModule } from 'ng-otp-input';
import { catchError, EMPTY, finalize } from 'rxjs';
import { AppError } from 'src/app/core/models/app-error.model';
import { AppStorageService } from 'src/app/core/services/storage/app-storage.service';
import { STORAGE_KEYS } from 'src/app/core/services/storage/storage-keys';
import { AuthHeaderComponent } from '../../components/auth-header/auth-header.component';
import { AuthPrimaryButtonComponent } from '../../components/auth-primary-button/auth-primary-button.component';
import { AuthErrorFacade } from '../../errors/auth-error.facade';
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
  private readonly authErrorFacade = inject(AuthErrorFacade);

  showLoadingDialog = signal(false);
  otpValue = signal('0');
  email = signal('');

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
    if (!this.email()) {
      return;
    }

    this.showLoadingDialog.set(true);
    this.authApi
      .resendVerification({ email: this.email() })
      .pipe(
        catchError((error: AppError) => {
          this.authErrorFacade.handle(error, 'verification');
          return EMPTY;
        }),
        finalize(() => {
          this.showLoadingDialog.set(false);
        })
      )
      .subscribe();
  }

  private async verifyAndLogin(): Promise<void> {
    if (this.showLoadingDialog()) {
      return;
    }

    const code = String(this.otpValue() ?? '').trim();
    if (!this.email() || code.length !== 6) {
      return;
    }

    this.showLoadingDialog.set(true);
    this.authApi
      .verifyEmail({ email: this.email(), code })
      .pipe(
        catchError((error: AppError) => {
          this.authErrorFacade.handle(error, 'verification');
          return EMPTY;
        }),
        finalize(() => {
          this.showLoadingDialog.set(false);
        })
      )
      .subscribe({
        next: async (response) => {
          await this.authService.login(response);
          await this.storage.remove(STORAGE_KEYS.pendingVerificationEmail);

          setTimeout(() => {
            void this.router.navigateByUrl('/tabs/home');
          }, 300);
        },
      });
  }
}
