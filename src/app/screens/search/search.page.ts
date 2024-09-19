import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit {

  filterOptionsList = ['Style', 'Travel', 'Nature', 'Decore', 'Art', 'Animal', 'Beauty'];
  selectedFilterOptionIndex = 0;
  publicPostsList = [
    {
      id: '1',
      image: '../../../assets/images/publicPosts/post1.png',
      isVideo: false,
    },
    {
      id: '2',
      image: '../../../assets/images/publicPosts/post2.png',
      isVideo: false,
    },
    {
      id: '3',
      image: '../../../assets/images/publicPosts/post3.png',
      isVideo: true,
    },
    {
      id: '4',
      image: '../../../assets/images/publicPosts/post4.png',
      isVideo: false,
    },
    {
      id: '5',
      image: '../../../assets/images/publicPosts/post5.png',
      isVideo: false,
    },
    {
      id: '6',
      image: '../../../assets/images/publicPosts/post6.png',
      isVideo: false,
    },
    {
      id: '7',
      image: '../../../assets/images/publicPosts/post8.png',
      isVideo: false,
    },
    {
      id: '8',
      image: '../../../assets/images/publicPosts/post9.png',
      isVideo: false,
    },
    {
      id: '9',
      image: '../../../assets/images/publicPosts/post10.png',
      isVideo: false,
    },
    {
      id: '10',
      image: '../../../assets/images/publicPosts/post11.png',
      isVideo: false,
    },
    {
      id: '11',
      image: '../../../assets/images/publicPosts/post12.png',
      isVideo: false,
    },
    {
      id: '12',
      image: '../../../assets/images/publicPosts/post13.png',
      isVideo: false,
    },
    {
      id: '13',
      image: '../../../assets/images/publicPosts/post14.png',
      isVideo: true,
    },
    {
      id: '14',
      image: '../../../assets/images/publicPosts/post15.png',
      isVideo: false,
    },
    {
      id: '15',
      image: '../../../assets/images/publicPosts/post16.png',
      isVideo: false,
    },
    {
      id: '16',
      image: '../../../assets/images/publicPosts/post17.png',
      isVideo: false,
    },
    {
      id: '17',
      image: '../../../assets/images/publicPosts/post18.png',
      isVideo: true,
    },
    {
      id: '18',
      image: '../../../assets/images/publicPosts/post19.png',
      isVideo: false,
    },
    {
      id: '19',
      image: '../../../assets/images/publicPosts/post20.png',
      isVideo: false,
    },
    {
      id: '20',
      image: '../../../assets/images/publicPosts/post21.png',
      isVideo: false,
    },
    {
      id: '21',
      image: '../../../assets/images/publicPosts/post22.png',
      isVideo: false,
    },
    {
      id: '22',
      image: '../../../assets/images/publicPosts/post23.png',
      isVideo: false,
    },
    {
      id: '23',
      image: '../../../assets/images/publicPosts/post24.png',
      isVideo: false,
    },
    {
      id: '24',
      image: '../../../assets/images/publicPosts/post25.png',
      isVideo: false,
    },
  ];

  constructor(private navCtrl: NavController, private router: Router) { }

  ngOnInit() {
  }

  goBack() {
    this.navCtrl.back()
  }

  goTo(screen: any) {
    this.router.navigateByUrl(screen);
  }

}
