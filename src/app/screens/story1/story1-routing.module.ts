import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Story1Page } from './story1.page';

const routes: Routes = [
  {
    path: '',
    component: Story1Page
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class Story1PageRoutingModule {}
