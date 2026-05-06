import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  viewChild,
  signal,
  computed,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { IonContent, IonText } from '@ionic/angular/standalone';
import { AppStorageService } from '../../../core/services/storage/app-storage.service';
import { STORAGE_KEYS } from '../../../core/services/storage/storage-keys';
import { OnboardingIndicatorsComponent } from '../components/onboarding-indicators/onboarding-indicators.component';
import { OnboardingSlideComponent } from '../components/onboarding-slide/onboarding-slide.component';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.page.html',
  styleUrls: ['./onboarding.page.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonContent,
    IonText,
    OnboardingSlideComponent,
    OnboardingIndicatorsComponent,
  ],
})
export class OnboardingPage {
  private readonly router = inject(Router);
  public readonly platform = inject(Platform);
  private readonly appStorageService = inject(AppStorageService);

  readonly swiperRef = viewChild<ElementRef>('swiper');

  readonly currentIndex = signal(0);

  readonly onboardingScreenList = signal([
    {
      id: '1',
      onboardingImage: '../../../assets/images/help-logo.png',
      onboardingTitle: 'We can help you !',
      onboardingDescription: '',
    },
    {
      id: '2',
      onboardingImage: '../../../assets/images/onboarding/onboarding1.png',
      onboardingTitle: 'Mind',
      onboardingDescription:
        'Mental health is essential for a fulfilling life. If you are facing anxiety, depression, suicidal thoughts, or other challenges, we are here to help',
    },
    {
      id: '3',
      onboardingImage: '../../../assets/images/onboarding/onboarding2.png',
      onboardingTitle: 'Body',
      onboardingDescription:
        'Health is essential for achieving your goals. If you are ready to treat your body with care and make a change, let us help you start your journey. Explore our resources and connect with experts today!',
    },
    {
      id: '4',
      onboardingImage: '../../../assets/images/onboarding/onboarding3.png',
      onboardingTitle: 'Soul',
      onboardingDescription:
        'Our souls are eternal energy, supported by the wisdom of our ancestors who guide us through life is challenges. At Help!, connect with trusted spiritual experts—clairvoyants, mediums, and Ifa priests—who offer insights from both scientific and metaphysical knowledge.',
    },
  ]);

  readonly screenHeight = signal(window.innerHeight);

  readonly isLastScreen = computed(() => {
    return this.currentIndex() >= this.onboardingScreenList().length - 1;
  });

  slideChangeCall() {
    const swiper = this.swiperRef()?.nativeElement.swiper;
    if (swiper) {
      this.currentIndex.set(swiper.activeIndex);
    }
  }

  async goTo(screen: string) {
    if (screen === '/auth/sign-in') {
      await this.appStorageService.setBoolean(
        STORAGE_KEYS.hasSeenOnboarding,
        true
      );
    }
    await this.router.navigateByUrl(screen);
  }

  async handleButtonPress() {
    const swiper = this.swiperRef()?.nativeElement.swiper;

    if (!swiper) {
      return;
    }

    if (this.isLastScreen()) {
      await this.appStorageService.setBoolean(
        STORAGE_KEYS.hasSeenOnboarding,
        true
      );
      await this.router.navigateByUrl('/auth/sign-in');
    } else {
      swiper.slideTo(this.currentIndex() + 1);
    }
  }
}
