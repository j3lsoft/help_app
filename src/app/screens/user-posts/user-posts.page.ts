import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-user-posts',
  templateUrl: './user-posts.page.html',
  styleUrls: ['./user-posts.page.scss'],
})
export class UserPostsPage implements OnInit {

  dummyText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ipsum amet pellentesque in rhoncus, in erat. Placerat et nunc ipsum donec urna feugiat suspendisse.';

  postsList = [
    {
      id: '1',
      aboutPost: this.dummyText,
      postLikes: '10k',
      postComments: '100',
      postShares: '35',
      postImage: '../../../assets/images/gallery/gallery1.png',
      postLike: true,
    },
    {
      id: '2',
      aboutPost: this.dummyText,
      postLikes: '10k',
      postComments: '100',
      postShares: '35',
      postImage: '../../../assets/images/gallery/gallery2.png',
      postLike: true,
    },
    {
      id: '3',
      aboutPost: this.dummyText,
      postLikes: '10k',
      postComments: '100',
      postShares: '35',
      postImage: '../../../assets/images/gallery/gallery3.png',
      postLike: true,
    },
    {
      id: '4',
      aboutPost: this.dummyText,
      postLikes: '10k',
      postComments: '100',
      postShares: '35',
      postImage: '../../../assets/images/gallery/gallery4.png',
      postLike: true,
    },
    {
      id: '5',
      aboutPost: this.dummyText,
      postLikes: '10k',
      postComments: '100',
      postShares: '35',
      postImage: '../../../assets/images/gallery/gallery5.png',
      postLike: true,
    },
  ];

  constructor(private router: Router, private navCtrl: NavController) { }

  ngOnInit() {
  }

  goBack() {
    this.navCtrl.back()
  }

}
