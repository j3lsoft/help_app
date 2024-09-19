import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PostCaptionAndTagPage } from './post-caption-and-tag.page';

const routes: Routes = [
  {
    path: '',
    component: PostCaptionAndTagPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PostCaptionAndTagPageRoutingModule {}
