import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-followings',
  templateUrl: './followings.page.html',
  styleUrls: ['./followings.page.scss'],
})
export class FollowingsPage implements OnInit {

  followingsList = [
    {
      id: '1',
      userProfilePic: '../../../assets/images/users/user27.png',
      userProfileName: 'royyy._____',
      userFullName: 'Roy Jain',
      isFollow: true,
    },
    {
      id: '2',
      userProfilePic: '../../../assets/images/users/user28.png',
      userProfileName: 'jiyashah_',
      userFullName: 'Jiya shah',
      isFollow: true,
    },
    {
      id: '3',
      userProfilePic: '../../../assets/images/users/user29.png',
      userProfileName: 'ishaofficial.',
      userFullName: 'Isha Ali',
      isFollow: true,
    },
    {
      id: '4',
      userProfilePic: '../../../assets/images/users/user30.png',
      userProfileName: 'diya.____',
      userFullName: 'Diya Mehta',
      isFollow: true,
    },
    {
      id: '5',
      userProfilePic: '../../../assets/images/users/user18.png',
      userProfileName: 'ishankhatri.',
      userFullName: 'Ishan Khatri',
      isFollow: true,
    },
    {
      id: '6',
      userProfilePic: '../../../assets/images/users/user31.png',
      userProfileName: 'vaishanavi__',
      userFullName: 'V',
      isFollow: true,
    },
    {
      id: '7',
      userProfilePic: '../../../assets/images/users/user14.png',
      userProfileName: 'dhirajshah__',
      userFullName: 'Dhiraj Shah',
      isFollow: true,
    },
    {
      id: '8',
      userProfilePic: '../../../assets/images/users/user32.png',
      userProfileName: 'monaliali.',
      userFullName: 'Monali',
      isFollow: true,
    },
    {
      id: '9',
      userProfilePic: '../../../assets/images/users/user33.png',
      userProfileName: 'anujshah.__',
      userFullName: 'Anuj Shah',
      isFollow: true,
    },
    {
      id: '10',
      userProfilePic: '../../../assets/images/users/user34.png',
      userProfileName: 'realkrupali.',
      userFullName: 'K',
      isFollow: true,
    },
    {
      id: '11',
      userProfilePic: '../../../assets/images/users/user5.png',
      userProfileName: 'tonyyyy',
      userFullName: 'Tonyy Doe',
      isFollow: true,
    },
    {
      id: '12',
      userProfilePic: '../../../assets/images/users/user36.png',
      userProfileName: 'renishshah.__',
      userFullName: 'Renish Shah',
      isFollow: true,
    },
    {
      id: '13',
      userProfilePic: '../../../assets/images/users/user37.png',
      userProfileName: 'joymehta.',
      userFullName: 'Joy',
      isFollow: true,
    },
    {
      id: '14',
      userProfilePic: '../../../assets/images/users/user38.png',
      userProfileName: 'officialjiyan__',
      userFullName: 'Jiyan Smith',
      isFollow: true,
    },
    {
      id: '15',
      userProfilePic: '../../../assets/images/users/user5.png',
      userProfileName: 'tonyyyy',
      userFullName: 'Tonyy Doe',
      isFollow: true,
    },
    {
      id: '16',
      userProfilePic: '../../../assets/images/users/user27.png',
      userProfileName: 'royyy._____',
      userFullName: 'Roy Jain',
      isFollow: true,
    },
    {
      id: '17',
      userProfilePic: '../../../assets/images/users/user33.png',
      userProfileName: 'anujshah.__',
      userFullName: 'Anuj Shah',
      isFollow: true,
    },
    {
      id: '18',
      userProfilePic: '../../../assets/images/users/user3.png',
      userProfileName: 'ishankhatri.',
      userFullName: 'Ishan Khatri',
      isFollow: true,
    },
    {
      id: '19',
      userProfilePic: '../../../assets/images/users/user39.png',
      userProfileName: 'trishaaaaa',
      userFullName: 'Trisha Jain',
      isFollow: true,
    },
    {
      id: '20',
      userProfilePic: '../../../assets/images/users/user40.png',
      userProfileName: 'komalshah',
      userFullName: 'Komal Shah',
      isFollow: true,
    },
  ];

  constructor( private navCtrl: NavController) { }

  ngOnInit() {
  }

  goBack() {
    this.navCtrl.back()
  }
}
