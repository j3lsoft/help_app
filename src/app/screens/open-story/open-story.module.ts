import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OpenStoryPageRoutingModule } from './open-story-routing.module';

import { OpenStoryPage } from './open-story.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OpenStoryPageRoutingModule
  ],
  declarations: [OpenStoryPage]
})
export class OpenStoryPageModule {}
