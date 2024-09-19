import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  usersStories = [
    {
      id: '1',
      userProfilePic: '../../../assets/images/users/user1.png',
      storySeen: false,
      userName: 'Shree',
    },
    {
      id: '2',
      userProfilePic: '../../../assets/images/users/user2.png',
      storySeen: false,
      userName: 'Alicia',
    },
    {
      id: '3',
      userProfilePic: '../../../assets/images/users/user3.png',
      storySeen: false,
      userName: 'Denny',
    },
    {
      id: '4',
      userProfilePic: '../../../assets/images/users/user4.png',
      storySeen: true,
      userName: 'Smiti',
    }, {
      id: '5',
      userProfilePic: '../../../assets/images/users/user5.png',
      storySeen: true,
      userName: 'Imran',
    }, {
      id: '6',
      userProfilePic: '../../../assets/images/users/user6.png',
      storySeen: true,
      userName: 'Dolly',
    }, {
      id: '7',
      userProfilePic: '../../../assets/images/users/user7.png',
      storySeen: true,
      userName: 'Denver',
    }, {
      id: '8',
      userProfilePic: '../../../assets/images/users/user8.png',
      storySeen: true,
      userName: 'Isha',
    }, {
      id: '9',
      userProfilePic: '../../../assets/images/users/user9.png',
      storySeen: true,
      userName: 'Trisha',
    }, {
      id: '10',
      userProfilePic: '../../../assets/images/users/user10.png',
      storySeen: true,
      userName: 'Roy',
    },
  ];

  dummyText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ipsum amet pellentesque in rhoncus, in erat. Placerat et nunc ipsum donec urna feugiat suspendisse.';

  todaysPostsList = [
    {
      id: '1',
      userProfilePic: '../../../assets/images/users/user2.png',
      userName: 'Alicia Sierra',
      userDetail: 'Allentown, New Mexico',
      aboutPost: this.dummyText,
      postLikes: '10k',
      postComments: '100',
      postShares: '35',
      postImage: '../../../assets/images/posts/post1.png',
      postLike: true,
    },
    {
      id: '2',
      userProfilePic: '../../../assets/images/users/user4.png',
      userName: 'Smiti Khana',
      userDetail: 'Allentown, New Mexico',
      aboutPost: this.dummyText,
      postLikes: '10k',
      postComments: '100',
      postShares: '35',
      postImage: '../../../assets/images/posts/post2.png',
      postLike: false,
    },
  ];

  suggestionsList = [
    {
      id: '1',
      userProfilePic: '../../../assets/images/users/user11.png',
      userName: 'Tina Shah',
      userAbout: 'realtinashah',
      isFollow: false,
    },
    {
      id: '2',
      userProfilePic: '../../../assets/images/users/user12.png',
      userName: 'Jiya Patel',
      userAbout: 'officialjiya',
      isFollow: false,
    },
    {
      id: '3',
      userProfilePic: '../../../assets/images/users/user13.png',
      userName: 'Joy Jain',
      userAbout: 'joyyyyy',
      isFollow: false,
    },
    {
      id: '4',
      userProfilePic: '../../../assets/images/users/user14.png',
      userName: 'Ishan Patel',
      userAbout: 'ishanpatel',
      isFollow: false,
    },
    {
      id: '5',
      userProfilePic: '../../../assets/images/users/user11.png',
      userName: 'Tina Shah',
      userAbout: 'realtinashah',
      isFollow: false,
    }
  ];

  oldPostsList = [
    {
      id: 'o1',
      userProfilePic: '../../../assets/images/users/user3.png',
      userName: 'Denny John',
      userDetail: 'Allentown, New Mexico',
      aboutPost: this.dummyText,
      postLikes: '10k',
      postComments: '100',
      postShares: '35',
      postImage: '../../../assets/images/posts/post3.png',
      postLike: true,
    },
    {
      id: 'o2',
      userProfilePic: '../../../assets/images/users/user8.png',
      userName: 'Roy Khurana',
      userDetail: 'Allentown, New Mexico',
      aboutPost: this.dummyText,
      postLikes: '10k',
      postComments: '100',
      postShares: '35',
      postImage: '../../../assets/images/posts/post4.png',
      postLike: false,
    },
    {
      id: 'o3',
      userProfilePic: '../../../assets/images/users/user10.png',
      userName: 'Ishan Khatri',
      userDetail: 'Allentown, New Mexico',
      aboutPost: this.dummyText,
      postLikes: '10k',
      postComments: '100',
      postShares: '35',
      postImage: '../../../assets/images/posts/post5.png',
      postLike: false,
    },
  ];

  constructor(private router: Router) { }

  ngOnInit() {
  }

  goTo(screen: any) {
    this.router.navigateByUrl(screen);
  }

}
