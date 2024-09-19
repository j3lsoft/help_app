import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FollowRequestsPageRoutingModule } from './follow-requests-routing.module';

import { FollowRequestsPage } from './follow-requests.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FollowRequestsPageRoutingModule
  ],
  declarations: [FollowRequestsPage]
})
export class FollowRequestsPageModule {}
