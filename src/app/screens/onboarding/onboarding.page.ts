import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.page.html',
  styleUrls: ['./onboarding.page.scss'],
})
export class OnboardingPage implements OnInit {

  @ViewChild('swiper') swiperRef: ElementRef | undefined;

  currentIndex = 0;

  onboardingScreenList = [
    {
      id: '1',
      onboardingImage: '../../../assets/images/onboarding/help-logo.png',
      onboardingTitle: 'We can help you !',
      onboardingDescription: ''
    },
    {
      id: '2',
      onboardingImage: '../../../assets/images/onboarding/onboarding1.png',
      onboardingTitle: 'Mind',
      onboardingDescription: 'Mental health is essential for a fulfilling life. If you are facing anxiety, depression, suicidal thoughts, or other challenges, we are here to help'
    },
    {
      id: '3',
      onboardingImage: '../../../assets/images/onboarding/onboarding2.png',
      onboardingTitle: 'Body',
      onboardingDescription: 'Health is essential for achieving your goals. If you are ready to treat your body with care and make a change, let us help you start your journey. Explore our resources and connect with experts today!'
    },
    {
      id: '4',
      onboardingImage: '../../../assets/images/onboarding/onboarding3.png',
      onboardingTitle: 'Soul',
      onboardingDescription: 'Our souls are eternal energy, supported by the wisdom of our ancestors who guide us through life is challenges. At Help!, connect with trusted spiritual experts—clairvoyants, mediums, and Ifa priests—who offer insights from both scientific and metaphysical knowledge.'
    },
  ];

  screenHeight = window.innerHeight;

  constructor(private router: Router, public platform: Platform) { }

  ngOnInit() {
  }

  slideChangeCall() {
    this.currentIndex = this.swiperRef?.nativeElement.swiper.activeIndex;
  }

  goTo(screen: any) {
    this.router.navigateByUrl(screen)
  }

  handleButtonPress() {
    if (this.currentIndex === 2) {
      this.router.navigateByUrl('/auth/sign-in')
    }
    else {
      this.swiperRef?.nativeElement.swiper.slideTo(this.currentIndex == 0 ? 1 : 2);
    }
  }

}
