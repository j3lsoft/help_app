import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BlockAccountsPageRoutingModule } from './block-accounts-routing.module';

import { BlockAccountsPage } from './block-accounts.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BlockAccountsPageRoutingModule
  ],
  declarations: [BlockAccountsPage]
})
export class BlockAccountsPageModule {}
