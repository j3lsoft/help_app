import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SearchChatPage } from './search-chat.page';

const routes: Routes = [
  {
    path: '',
    component: SearchChatPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SearchChatPageRoutingModule {}
