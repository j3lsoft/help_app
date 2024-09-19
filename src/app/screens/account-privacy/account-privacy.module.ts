import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AccountPrivacyPageRoutingModule } from './account-privacy-routing.module';

import { AccountPrivacyPage } from './account-privacy.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AccountPrivacyPageRoutingModule
  ],
  declarations: [AccountPrivacyPage],
})
export class AccountPrivacyPageModule {}
