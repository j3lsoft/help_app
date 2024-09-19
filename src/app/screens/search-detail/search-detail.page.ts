import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-search-detail',
  templateUrl: './search-detail.page.html',
  styleUrls: ['./search-detail.page.scss'],
})
export class SearchDetailPage implements OnInit {

  topSearchesList: any = [
    {
      id: '1',
      userProfilePic: '../../../assets/images/users/user3.png',
      userProfileName: 'dennyjohn._',
      userFullName: 'Denny John',
      isFollow: true,
      storyAvailable: true,
    },
    {
      id: '2',
      userProfilePic: '../../../assets/images/users/user2.png',
      userProfileName: 'alicia___',
      userFullName: 'Alicia Sierra',
      isFollow: true,
      storyAvailable: true,
    },
    {
      id: '3',
      userProfilePic: '../../../assets/images/users/user15.png',
      userProfileName: 'tishaaaa',
      userFullName: 'Tisha Jain',
      isFollow: false,
      storyAvailable: false,
    },
    {
      id: '4',
      userProfilePic: '../../../assets/images/users/user16.png',
      userProfileName: 'benafsha.',
      userFullName: 'Benafsha Doe',
      isFollow: false,
      storyAvailable: true,
    },
    {
      id: '5',
      userProfilePic: '../../../assets/images/users/user17.png',
      userProfileName: 'tonny_.',
      userFullName: 'Tonny Shah',
      isFollow: false,
      storyAvailable: false,
    },
    {
      id: '6',
      userProfilePic: '../../../assets/images/users/user18.png',
      userProfileName: 'realimranali',
      userFullName: 'Imran Ali',
      isFollow: false,
      storyAvailable: false,
    },
    {
      id: '7',
      userProfilePic: '../../../assets/images/users/user3.png',
      userProfileName: 'dennyjohn._',
      userFullName: 'Denny John',
      isFollow: false,
      storyAvailable: true,
    },
    {
      id: '8',
      userProfilePic: '../../../assets/images/users/user2.png',
      userProfileName: 'alicia___',
      userFullName: 'Alicia Sierra',
      isFollow: false,
      storyAvailable: true,
    },
    {
      id: '9',
      userProfilePic: '../../../assets/images/users/user15.png',
      userProfileName: 'tishaaaa',
      userFullName: 'Tisha Jain',
      isFollow: false,
      storyAvailable: false,
    },
    {
      id: '10',
      userProfilePic: '../../../assets/images/users/user16.png',
      userProfileName: 'benafsha.',
      userFullName: 'Benafsha Doe',
      isFollow: false,
      storyAvailable: true,
    },
    {
      id: '11',
      userProfilePic: '../../../assets/images/users/user3.png',
      userProfileName: 'dennyjohn._',
      userFullName: 'Denny John',
      isFollow: false,
      storyAvailable: true,
    },
    {
      id: '12',
      userProfilePic: '../../../assets/images/users/user2.png',
      userProfileName: 'alicia___',
      userFullName: 'Alicia Sierra',
      isFollow: false,
      storyAvailable: true,
    },
    {
      id: '13',
      userProfilePic: '../../../assets/images/users/user15.png',
      userProfileName: 'tishaaaa',
      userFullName: 'Tisha Jain',
      isFollow: false,
      storyAvailable: false,
    },
  ];

  accountSearchesList: any = [
    {
      id: '1',
      userProfilePic: '../../../assets/images/users/user3.png',
      userProfileName: 'dennyjohn._',
      userFullName: 'Denny John',
      isFollow: true,
      storyAvailable: true,
    },
    {
      id: '2',
      userProfilePic: '../../../assets/images/users/user2.png',
      userProfileName: 'alicia___',
      userFullName: 'Alicia Sierra',
      isFollow: true,
      storyAvailable: true,
    },
    {
      id: '3',
      userProfilePic: '../../../assets/images/users/user15.png',
      userProfileName: 'tishaaaa',
      userFullName: 'Tisha Jain',
      isFollow: false,
      followedByUsers: ['alicia___', '', '', '', '', '', '', ''],
      storyAvailable: false,
    },
    {
      id: '4',
      userProfilePic: '../../../assets/images/users/user16.png',
      userProfileName: 'benafsha.',
      userFullName: 'Benafsha Doe',
      isFollow: false,
      followedByUsers: ['smiti_', '', '', '', '', '', '', '', '', '', '', ''],
      storyAvailable: true,
    },
    {
      id: '5',
      userProfilePic: '../../../assets/images/users/user17.png',
      userProfileName: 'tonny_.',
      userFullName: 'Tonny Shah',
      isFollow: true,
      storyAvailable: false,
    },
    {
      id: '6',
      userProfilePic: '../../../assets/images/users/user18.png',
      userProfileName: 'realimranali',
      userFullName: 'Imran Ali',
      isFollow: false,
      followedByUsers: ['alicia___', '', '', '', '', '', ''],
      storyAvailable: false,
    },
    {
      id: '7',
      userProfilePic: '../../../assets/images/users/user3.png',
      userProfileName: 'dennyjohn._',
      userFullName: 'Denny John',
      isFollow: true,
      storyAvailable: true,
    },
    {
      id: '8',
      userProfilePic: '../../../assets/images/users/user2.png',
      userProfileName: 'alicia___',
      userFullName: 'Alicia Sierra',
      isFollow: false,
      followedByUsers: ['smiti_', '', '', '', '', '', '', '', '', '', ''],
      storyAvailable: true,
    },
    {
      id: '9',
      userProfilePic: '../../../assets/images/users/user15.png',
      userProfileName: 'tishaaaa',
      userFullName: 'Tisha Jain',
      isFollow: false,
      followedByUsers: ['alicia___', '', '', '', '', '', '', '', ''],
      storyAvailable: false,
    },
    {
      id: '10',
      userProfilePic: '../../../assets/images/users/user16.png',
      userProfileName: 'benafsha.',
      userFullName: 'Benafsha Doe',
      isFollow: false,
      followedByUsers: ['smiti_', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      storyAvailable: true,
    },
    {
      id: '11',
      userProfilePic: '../../../assets/images/users/user3.png',
      userProfileName: 'dennyjohn._',
      userFullName: 'Denny John',
      isFollow: false,
      followedByUsers: ['alicia___', '', '', '', '', '', ''],
      storyAvailable: true,
    },
    {
      id: '12',
      userProfilePic: '../../../assets/images/users/user2.png',
      userProfileName: 'alicia___',
      userFullName: 'Alicia Sierra',
      isFollow: false,
      followedByUsers: ['alicia___', '', '', '', '', '', ''],
      storyAvailable: true,
    },
    {
      id: '13',
      userProfilePic: '../../../assets/images/users/user15.png',
      userProfileName: 'tishaaaa',
      userFullName: 'Tisha Jain',
      isFollow: true,
      storyAvailable: false,
    },
  ];

  tagSearchesList: any = [
    {
      id: '1',
      userProfilePic: '../../../assets/images/users/user19.png',
      hastag: '#surfing',
      postsCount: '1.5m',
    },
    {
      id: '21',
      userProfilePic: '../../../assets/images/users/user20.png',
      hastag: '#landscape',
      postsCount: '57,793,278',
    },
    {
      id: '3',
      userProfilePic: '../../../assets/images/users/user21.png',
      hastag: '#landscapephotography',
      postsCount: '57,793,278',
    },
    {
      id: '4',
      userProfilePic: '../../../assets/images/users/user22.png',
      hastag: '#storyart',
      postsCount: '4.5m',
    },
    {
      id: '5',
      userProfilePic: '../../../assets/images/users/user23.png',
      hastag: '#drink',
      postsCount: '4.5m',
    },
    {
      id: '6',
      userProfilePic: '../../../assets/images/users/user24.png',
      hastag: '#traveldairies',
      postsCount: '4.5m',
    },
    {
      id: '7',
      userProfilePic: '../../../assets/images/users/user25.png',
      hastag: '#cocoresidencemaldives',
      postsCount: '5.5m',
    },
    {
      id: '8',
      userProfilePic: '../../../assets/images/users/user26.png',
      hastag: '#travelworld',
      postsCount: '1.5m',
    },
    {
      id: '9',
      userProfilePic: '../../../assets/images/users/user19.png',
      hastag: '#surfing',
      postsCount: '1.5m',
    },
    {
      id: '10',
      userProfilePic: '../../../assets/images/users/user20.png',
      hastag: '#landscape',
      postsCount: '57,793,278',
    },
    {
      id: '11',
      userProfilePic: '../../../assets/images/users/user21.png',
      hastag: '#landscapephotography',
      postsCount: '57,793,278',
    },
  ];

  selectedTabValue = 'Top';

  constructor(private navCtrl: NavController, private router: Router) { }

  ngOnInit() {
  }

  goBack() {
    this.navCtrl.back()
  }

  goTo(screen: any) {
    this.router.navigateByUrl(screen);
  }

  onFilterUpdate(event: any) {
    this.selectedTabValue = event.detail.value
  }
}
