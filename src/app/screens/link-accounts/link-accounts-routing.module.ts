import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LinkAccountsPage } from './link-accounts.page';

const routes: Routes = [
  {
    path: '',
    component: LinkAccountsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LinkAccountsPageRoutingModule {}
