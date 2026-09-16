import { NgFor } from '@angular/common';
import { Component, inject } from '@angular/core';
import { IonicModule, NavController } from '@ionic/angular';

@Component({
  selector: 'app-search-chat',
  templateUrl: './search-chat.page.html',
  styleUrls: ['./search-chat.page.scss'],
  imports: [IonicModule, NgFor],
})
export class SearchChatPage {
  private navCtrl = inject(NavController);

  recentSearchesList = [
    {
      id: '1',
      userProfilePic: '../../../assets/images/users/user29.png',
      userProfileName: 'mina._',
    },
    {
      id: '2',
      userProfilePic: '../../../assets/images/users/user18.png',
      userProfileName: 'shahrenish',
    },
    {
      id: '3',
      userProfilePic: '../../../assets/images/users/user41.png',
      userProfileName: 'diyapatel.',
    },
    {
      id: '4',
      userProfilePic: '../../../assets/images/users/user32.png',
      userProfileName: 'monaliali.',
    },
  ];

  goBack() {
    this.navCtrl.back();
  }
}
