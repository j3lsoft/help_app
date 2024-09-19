import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { Story1PageRoutingModule } from './story1-routing.module';

import { Story1Page } from './story1.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    Story1PageRoutingModule
  ],
  declarations: [Story1Page]
})
export class Story1PageModule {}
