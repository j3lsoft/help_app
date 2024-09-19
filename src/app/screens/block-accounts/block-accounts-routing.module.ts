import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BlockAccountsPage } from './block-accounts.page';

const routes: Routes = [
  {
    path: '',
    component: BlockAccountsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BlockAccountsPageRoutingModule {}
