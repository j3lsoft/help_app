import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AccountPrivacyPage } from './account-privacy.page';

const routes: Routes = [
  {
    path: '',
    component: AccountPrivacyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountPrivacyPageRoutingModule {}
