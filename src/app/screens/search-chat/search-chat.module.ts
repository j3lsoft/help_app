import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SearchChatPageRoutingModule } from './search-chat-routing.module';

import { SearchChatPage } from './search-chat.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SearchChatPageRoutingModule
  ],
  declarations: [SearchChatPage]
})
export class SearchChatPageModule {}
