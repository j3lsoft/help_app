import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HelpDetailPage } from './help-detail.page';

const routes: Routes = [
  {
    path: '',
    component: HelpDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HelpDetailPageRoutingModule {}
