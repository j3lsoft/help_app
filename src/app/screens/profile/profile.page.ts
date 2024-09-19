import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController, NavController } from '@ionic/angular';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  allPosts = [
    {
      id: '1',
      image: '../../../assets/images/gallery/gallery1.png',
    },
    {
      id: '2',
      image: '../../../assets/images/gallery/gallery2.png',
    },
    {
      id: '3',
      image: '../../../assets/images/gallery/gallery3.png',
    },
    {
      id: '4',
      image: '../../../assets/images/gallery/gallery4.png',
    },
    {
      id: '5',
      image: '../../../assets/images/gallery/gallery5.png',
    },
    {
      id: '6',
      image: '../../../assets/images/gallery/gallery6.png',
    },
    {
      id: '7',
      image: '../../../assets/images/gallery/gallery7.png',
    },
    {
      id: '8',
      image: '../../../assets/images/gallery/gallery8.png',
    },
    {
      id: '9',
      image: '../../../assets/images/gallery/gallery9.png',
    },
    {
      id: '10',
      image: '../../../assets/images/gallery/gallery10.png',
    },
    {
      id: '11',
      image: '../../../assets/images/gallery/gallery11.png',
    },
    {
      id: '12',
      image: '../../../assets/images/gallery/gallery12.png',
    },
    {
      id: '13',
      image: '../../../assets/images/gallery/gallery13.png',
    },
    {
      id: '14',
      image: '../../../assets/images/gallery/gallery14.png',
    },
    {
      id: '15',
      image: '../../../assets/images/gallery/gallery15.png',
    },
  ];

  videoPosts = [
    {
      id: '1',
      image: '../../../assets/images/videoThumbnails/thumbnail1.png',
      views: '190k',
    },
    {
      id: '2',
      image: '../../../assets/images/videoThumbnails/thumbnail2.png',
      views: '200k',
    },
    {
      id: '3',
      image: '../../../assets/images/videoThumbnails/thumbnail3.png',
      views: '120k',
    },
    {
      id: '4',
      image: '../../../assets/images/videoThumbnails/thumbnail4.png',
      views: '190k',
    },
    {
      id: '5',
      image: '../../../assets/images/videoThumbnails/thumbnail5.png',
      views: '200k',
    },
    {
      id: '6',
      image: '../../../assets/images/videoThumbnails/thumbnail6.png',
      views: '120k',
    },
    {
      id: '7',
      image: '../../../assets/images/videoThumbnails/thumbnail7.png',
      views: '190k',
    },
    {
      id: '8',
      image: '../../../assets/images/videoThumbnails/thumbnail8.png',
      views: '200k',
    },
    {
      id: '9',
      image: '../../../assets/images/videoThumbnails/thumbnail9.png',
      views: '120k',
    },
    {
      id: '10',
      image: '../../../assets/images/videoThumbnails/thumbnail10.png',
      views: '190k',
    },
    {
      id: '11',
      image: '../../../assets/images/videoThumbnails/thumbnail11.png',
      views: '190k',
    },
    {
      id: '12',
      image: '../../../assets/images/videoThumbnails/thumbnail12.png',
      views: '200k',
    },
  ];

  imagePosts = [
    {
      id: '1',
      image: '../../../assets/images/posts/post26.png',
    },
    {
      id: '2',
      image: '../../../assets/images/posts/post27.png',
    },
    {
      id: '3',
      image: '../../../assets/images/posts/post28.png',
    },
    {
      id: '4',
      image: '../../../assets/images/posts/post29.png',
    },
    {
      id: '5',
      image: '../../../assets/images/gallery/gallery2.png',
    },
  ];

  selectedTabValue = 'All'
  storyAvailable = false;
  isFollow = false;

  constructor(private navCtrl: NavController, private menuCtrl: MenuController, private router: Router) { }

  ngOnInit() {
  }

  goBack() {
    this.navCtrl.back();
  }

  goTo(screen: any) {
    this.router.navigateByUrl(screen);
  }

  onFilterUpdate(event: any) {
    this.selectedTabValue = event.detail.value
  }

  openDrawer() {
    this.menuCtrl.open()
  }

}
