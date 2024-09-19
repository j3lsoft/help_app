import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController, PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.page.html',
  styleUrls: ['./create-post.page.scss'],
})

export class CreatePostPage implements OnInit {

  isPopoverOpen = false;
  photosList = [
    {
      id: '1',
      photo: '../../../assets/images/gallery/gallery18.png',
    },
    {
      id: '2',
      photo: '../../../assets/images/gallery/gallery19.png',
    },
    {
      id: '3',
      photo: '../../../assets/images/gallery/gallery20.png',
    },
    {
      id: '4',
      photo: '../../../assets/images/gallery/gallery21.png',
    },
    {
      id: '5',
      photo: '../../../assets/images/gallery/gallery22.png',
    },
    {
      id: '6',
      photo: '../../../assets/images/gallery/gallery23.png',
    },
    {
      id: '7',
      photo: '../../../assets/images/gallery/gallery24.png',
    },
    {
      id: '8',
      photo: '../../../assets/images/gallery/gallery25.png',
    },
    {
      id: '9',
      photo: '../../../assets/images/gallery/gallery26.png',
    },
    {
      id: '10',
      photo: '../../../assets/images/gallery/gallery27.png',
    },
    {
      id: '11',
      photo: '../../../assets/images/gallery/gallery28.png',
    },
    {
      id: '12',
      photo: '../../../assets/images/gallery/gallery29.png',
    },
  ];
  photoOptions = ['Photos', 'Gallery', 'Camera', 'Crop Images'];
  selectedOption = this.photoOptions[0];
  selectedImage = this.photosList[0].photo;

  constructor(private navCtrl: NavController, private router: Router, public popCtrl: PopoverController) { }

  ngOnInit() {
  }

  goBack() {
    this.navCtrl.back()
  }

  goToPostFilter() {
    this.router.navigate(['/', 'post-filter', this.selectedImage])
  }

  goTo(screen: any) {
    this.router.navigateByUrl(screen);
  }

}
