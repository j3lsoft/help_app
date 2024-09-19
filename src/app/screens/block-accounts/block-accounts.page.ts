import { Component, OnInit } from '@angular/core';
import { NavController, Platform } from '@ionic/angular';

@Component({
  selector: 'app-block-accounts',
  templateUrl: './block-accounts.page.html',
  styleUrls: ['./block-accounts.page.scss'],
})
export class BlockAccountsPage implements OnInit {

  blockAccountsList:any = [
    {
      id: '1',
      userProfilePic: '../../../assets/images/users/user27.png',
      userProfileName: 'royyy._____',
      userFullName: 'Roy Jain',
    },
    {
      id: '2',
      userProfilePic: '../../../assets/images/users/user28.png',
      userProfileName: 'jiyashah_',
      userFullName: 'Jiya shah',
    },
    {
      id: '3',
      userProfilePic: '../../../assets/images/users/user29.png',
      userProfileName: 'ishaofficial.',
      userFullName: 'Isha Ali',
    },
    {
      id: '4',
      userProfilePic: '../../../assets/images/users/user30.png',
      userProfileName: 'diya.____',
      userFullName: 'Diya Mehta',
    },
    {
      id: '5',
      userProfilePic: '../../../assets/images/users/user18.png',
      userProfileName: 'ishankhatri.',
      userFullName: 'Ishan Khatri',
    },
    {
      id: '6',
      userProfilePic: '../../../assets/images/users/user31.png',
      userProfileName: 'vaishanavi__',
      userFullName: 'V',
    },
    {
      id: '7',
      userProfilePic: '../../../assets/images/users/user14.png',
      userProfileName: 'dhirajshah__',
      userFullName: 'Dhiraj Shah',
    },
    {
      id: '8',
      userProfilePic: '../../../assets/images/users/user32.png',
      userProfileName: 'monaliali.',
      userFullName: 'Monali',
    },
  ];
  tostMsg = '';
  isToastOpen = false;

  constructor(private navCtrl: NavController, public platform: Platform) { }

  ngOnInit() {
  }

  goBack() {
    this.navCtrl.back()
  }

  unBlockUser(id: any, index: any) {
    this.tostMsg = this.blockAccountsList[index].userProfileName + ' is unblocked';
    this.blockAccountsList = this.blockAccountsList.filter((item:any) => item.id !== id);
    this.isToastOpen = true;
  }

}
