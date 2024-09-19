import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PostCaptionAndTagPageRoutingModule } from './post-caption-and-tag-routing.module';

import { PostCaptionAndTagPage } from './post-caption-and-tag.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PostCaptionAndTagPageRoutingModule
  ],
  declarations: [PostCaptionAndTagPage]
})
export class PostCaptionAndTagPageModule {}
