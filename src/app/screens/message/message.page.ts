import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-message',
  templateUrl: './message.page.html',
  styleUrls: ['./message.page.scss'],
})
export class MessagePage implements OnInit {

  selectedTabValue = 'Chats';
  usersList = [
    {
      id: '1',
      userName: 'jiya',
      userProfilePic: '../../../assets/images/users/user12.png',
      userProfileName: 'jiyashah_',
      lastMsg: 'Lorem Ipsum is simply dummy text',
      lastMsgTime: '10:50 am',
      isActive: true,
    },
    {
      id: '2',
      userName: 'roy',
      userProfilePic: '../../../assets/images/users/user44.png',
      userProfileName: 'royyy.___',
      lastMsg: 'Lorem Ipsum is simply dummy text',
      lastMsgTime: '10:30 am',
      isActive: true,
    },
    {
      id: '3',
      userName: 'monali',
      userProfilePic: '../../../assets/images/users/user29.png',
      userProfileName: 'monaliali.',
      lastMsg: 'Lorem Ipsum is simply dummy text',
      lastMsgTime: '10:28 am',
      isActive: false,
    },
    {
      id: '4',
      userName: 'dhiraj',
      userProfilePic: '../../../assets/images/users/user13.png',
      userProfileName: 'dhirajshah__',
      lastMsg: 'Lorem Ipsum is simply dummy text',
      lastMsgTime: '10:20 am',
      isActive: false,
    },
    {
      id: '5',
      userName: 'vaishanavi',
      userProfilePic: '../../../assets/images/users/user31.png',
      userProfileName: 'vaishanavi__',
      lastMsg: 'Lorem Ipsum is simply dummy text',
      lastMsgTime: '10:15 am',
      isActive: true,
    },
    {
      id: '6',
      userName: 'ishan',
      userProfilePic: '../../../assets/images/users/user14.png',
      userProfileName: 'ishankhatri.',
      lastMsg: 'Lorem Ipsum is simply dummy text',
      lastMsgTime: '10:00 am',
      isActive: true,
    },
    {
      id: '7',
      userName: 'diya',
      userProfilePic: '../../../assets/images/users/user32.png',
      userProfileName: 'diya.___',
      lastMsg: 'Lorem Ipsum is simply dummy text',
      lastMsgTime: '9:45 am',
      isActive: true,
    },
    {
      id: '8',
      userName: 'isha',
      userProfilePic: '../../../assets/images/users/user45.png',
      userProfileName: 'ishaofficial.',
      lastMsg: 'Lorem Ipsum is simply dummy text',
      lastMsgTime: '9:00 am',
      isActive: true,
    },
    {
      id: '9',
      userName: 'jiya',
      userProfilePic: '../../../assets/images/users/user10.png',
      userProfileName: 'jiyashah_',
      lastMsg: 'Lorem Ipsum is simply dummy text',
      lastMsgTime: '10:50 am',
      isActive: true,
    },
    {
      id: '10',
      userName: 'roy',
      userProfilePic: '../../../assets/images/users/user3.png',
      userProfileName: 'royyy.___',
      lastMsg: 'Lorem Ipsum is simply dummy text',
      lastMsgTime: '10:30 am',
      isActive: true,
    },
    {
      id: '11',
      userName: 'monali',
      userProfilePic: '../../../assets/images/users/user27.png',
      userProfileName: 'monaliali.',
      lastMsg: 'Lorem Ipsum is simply dummy text',
      lastMsgTime: '10:28 am',
      isActive: false,
    },
    {
      id: '12',
      userName: 'dhiraj',
      userProfilePic: '../../../assets/images/users/user5.png',
      userProfileName: 'dhirajshah__',
      lastMsg: 'Lorem Ipsum is simply dummy text',
      lastMsgTime: '10:20 am',
      isActive: false,
    },
    {
      id: '13',
      userName: 'vaishanavi',
      userProfilePic: '../../../assets/images/users/user6.png',
      userProfileName: 'vaishanavi__',
      lastMsg: 'Lorem Ipsum is simply dummy text',
      lastMsgTime: '10:15 am',
      isActive: true,
    },
    {
      id: '14',
      userName: 'ishan',
      userProfilePic: '../../../assets/images/users/user8.png',
      userProfileName: 'ishankhatri.',
      lastMsg: 'Lorem Ipsum is simply dummy text',
      lastMsgTime: '10:00 am',
      isActive: true,
    },
    {
      id: '15',
      userName: 'diya',
      userProfilePic: '../../../assets/images/users/user2.png',
      userProfileName: 'diya.___',
      lastMsg: 'Lorem Ipsum is simply dummy text',
      lastMsgTime: '9:45 am',
      isActive: true,
    },
    {
      id: '16',
      userName: 'isha',
      userProfilePic: '../../../assets/images/users/user1.png',
      userProfileName: 'ishaofficial.',
      lastMsg: 'Lorem Ipsum is simply dummy text',
      lastMsgTime: '9:00 am',
      isActive: true,
    },
  ];

  callingList = [
    {
      id: '1',
      userProfilePic: '../../../assets/images/users/user12.png',
      userProfileName: 'jiyashah_',
      callingType: 'missed',
      callingTime: '10:50 am',
      isActive: true,
    },
    {
      id: '2',
      userProfilePic: '../../../assets/images/users/user29.png',
      userProfileName: 'monaliali.',
      callingType: 'incoming',
      callingTime: '10:00 am',
      isActive: true,
    },
    {
      id: '3',
      userProfilePic: '../../../assets/images/users/user14.png',
      userProfileName: 'ishankhatri.',
      callingType: 'incoming',
      callingTime: '9:45 am',
      isActive: false,
    },
    {
      id: '4',
      userProfilePic: '../../../assets/images/users/user13.png',
      userProfileName: 'dhirajshah__',
      callingType: 'outgoing',
      callingTime: '9:00 am',
      isActive: false,
    },
    {
      id: '5',
      userProfilePic: '../../../assets/images/users/user44.png',
      userProfileName: 'royyy.___',
      callingType: 'missed',
      callingTime: '8:45 am',
      isActive: false,
    },
    {
      id: '6',
      userProfilePic: '../../../assets/images/users/user32.png',
      userProfileName: 'diya.___',
      callingType: 'incoming',
      callingTime: '8:00 am',
      isActive: false,
    },
  ];

  activeUsersList = this.usersList.filter((i) => i.isActive)

  constructor(private router: Router) { }

  ngOnInit() {
  }

  onFilterUpdate(event: any) {
    this.selectedTabValue = event.detail.value
  }

  goTo(screen: any) {
    this.router.navigateByUrl(screen);
  }

}
