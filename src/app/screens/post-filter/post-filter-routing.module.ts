import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PostFilterPage } from './post-filter.page';

const routes: Routes = [
  {
    path: '',
    component: PostFilterPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PostFilterPageRoutingModule {}
