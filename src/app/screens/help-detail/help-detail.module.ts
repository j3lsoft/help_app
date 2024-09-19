import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HelpDetailPageRoutingModule } from './help-detail-routing.module';

import { HelpDetailPage } from './help-detail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HelpDetailPageRoutingModule
  ],
  declarations: [HelpDetailPage]
})
export class HelpDetailPageModule {}
