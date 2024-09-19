import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OpenStoryPage } from './open-story.page';

const routes: Routes = [
  {
    path: '',
    component: OpenStoryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OpenStoryPageRoutingModule {}
