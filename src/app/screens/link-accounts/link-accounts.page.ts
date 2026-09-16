import { NgFor } from '@angular/common';
import { Component, inject } from '@angular/core';
import { IonicModule, NavController } from '@ionic/angular';

@Component({
  selector: 'app-link-accounts',
  templateUrl: './link-accounts.page.html',
  styleUrls: ['./link-accounts.page.scss'],
  imports: [IonicModule, NgFor],
})
export class LinkAccountsPage {
  private navCtrl = inject(NavController);

  linkedAccountsList = [
    {
      id: '1',
      socialMediaIcon: '../../../assets/images/icons/facebook.png',
      soialMedia: 'Facebook',
    },
    {
      id: '2',
      socialMediaIcon: '../../../assets/images/icons/google.png',
      soialMedia: 'Google',
    },
    {
      id: '3',
      socialMediaIcon: '../../../assets/images/icons/twitter.png',
      soialMedia: 'Twitter',
    },
    {
      id: '4',
      socialMediaIcon: '../../../assets/images/icons/linkedIn.png',
      soialMedia: 'Linkedin',
    },
  ];

  goBack() {
    this.navCtrl.back();
  }
}
