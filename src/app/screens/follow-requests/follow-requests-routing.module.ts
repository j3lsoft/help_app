import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FollowRequestsPage } from './follow-requests.page';

const routes: Routes = [
  {
    path: '',
    component: FollowRequestsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FollowRequestsPageRoutingModule {}
