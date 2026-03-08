import { Component, OnInit } from '@angular/core';
import { NavController, IonicModule } from '@ionic/angular';
import { NgFor } from '@angular/common';

@Component({
    selector: 'app-link-accounts',
    templateUrl: './link-accounts.page.html',
    styleUrls: ['./link-accounts.page.scss'],
    imports: [IonicModule, NgFor],
})
export class LinkAccountsPage implements OnInit {

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

  constructor(private navCtrl: NavController) { }

  ngOnInit() {
  }

  goBack() {
    this.navCtrl.back()
  }
}
