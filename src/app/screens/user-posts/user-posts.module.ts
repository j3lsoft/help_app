import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { UserPostsPageRoutingModule } from './user-posts-routing.module';
import { UserPostsPage } from './user-posts.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UserPostsPageRoutingModule,
  ],
  declarations: [UserPostsPage]
})
export class UserPostsPageModule {}
