import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-search-chat',
  templateUrl: './search-chat.page.html',
  styleUrls: ['./search-chat.page.scss'],
})
export class SearchChatPage implements OnInit {

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
    }
  ];

  constructor(private navCtrl: NavController) { }

  ngOnInit() {
  }

  goBack() {
    this.navCtrl.back();
  }

}
