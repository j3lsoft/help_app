import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-create-story',
  templateUrl: './create-story.page.html',
  styleUrls: ['./create-story.page.scss'],
})
export class CreateStoryPage implements OnInit {

  storyOptions = [
    {
      id: '1',
      icon: '../../../assets/images/icons/text.png',
      option: 'Text Story',
      color1: '#00D2FF',
      color2: '#3A7BD5',
    },
    {
      id: '2',
      icon: '../../../assets/images/icons/camera.png',
      option: 'Camera',
      color1: '#F857A6',
      color2: '#FF5858',
    },
    {
      id: '3',
      icon: '../../../assets/images/icons/music.png',
      option: 'Music',
      color1: '#FFE259',
      color2: '#FFA751',
    },
    {
      id: '4',
      icon: '../../../assets/images/icons/selfi.png',
      option: 'Selfie',
      color1: '#799F0C',
      color2: '#ACBB78',
    },
    {
      id: '5',
      icon: '../../../assets/images/icons/boomerang.png',
      option: 'Boomerang',
      color1: '#4CB8C4',
      color2: '#3CD3AD',
    },
  ];

  galleryImages = [
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
    {
      id: '16',
      image: '../../../assets/images/gallery/gallery1.png',
    },
    {
      id: '17',
      image: '../../../assets/images/gallery/gallery16.png',
    },
    {
      id: '18',
      image: '../../../assets/images/gallery/gallery17.png',
    },
  ];

  constructor(private navCtrl: NavController, private router: Router,) { }

  ngOnInit() {
  }

  goBack() {
    this.navCtrl.back()
  }

  goTo(screen: any) {
    this.router.navigateByUrl(screen);
  }

}
