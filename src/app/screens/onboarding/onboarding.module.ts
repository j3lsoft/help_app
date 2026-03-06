import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OnboardingPageRoutingModule } from './onboarding-routing.module';

import { OnboardingPage } from './onboarding.page';
import { OnboardingSlideComponent } from './components/onboarding-slide/onboarding-slide.component';
import { OnboardingIndicatorsComponent } from './components/onboarding-indicators/onboarding-indicators.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OnboardingPageRoutingModule
  ],
  declarations: [
    OnboardingPage,
    OnboardingSlideComponent,
    OnboardingIndicatorsComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class OnboardingPageModule { }
