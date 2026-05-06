import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { ViewDidEnter } from '@ionic/angular';
import { IonContent, IonImg } from '@ionic/angular/standalone';
import { timer } from 'rxjs';
import { AppStorageService } from '../../../core/services/storage/app-storage.service';
import { STORAGE_KEYS } from '../../../core/services/storage/storage-keys';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonImg, IonContent],
})
export class SplashPage implements ViewDidEnter {
  private readonly router = inject(Router);
  private readonly appStorageService = inject(AppStorageService);
  private readonly destroyRef = inject(DestroyRef);

  ionViewDidEnter() {
    timer(2000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        void this.navigateNext();
      });
  }

  private async navigateNext(): Promise<void> {
    const hasSeenOnboarding = await this.appStorageService.getBoolean(
      STORAGE_KEYS.hasSeenOnboarding
    );

    const targetUrl = hasSeenOnboarding ? '/auth/sign-in' : '/onboarding';
    await this.router.navigateByUrl(targetUrl);
  }
}
