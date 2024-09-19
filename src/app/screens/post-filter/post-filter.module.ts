import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PostFilterPageRoutingModule } from './post-filter-routing.module';

import { PostFilterPage } from './post-filter.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PostFilterPageRoutingModule
  ],
  declarations: [PostFilterPage]
})
export class PostFilterPageModule {}
