import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LinkAccountsPageRoutingModule } from './link-accounts-routing.module';

import { LinkAccountsPage } from './link-accounts.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LinkAccountsPageRoutingModule
  ],
  declarations: [LinkAccountsPage]
})
export class LinkAccountsPageModule {}
