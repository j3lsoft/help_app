import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-videos',
  templateUrl: './videos.page.html',
  styleUrls: ['./videos.page.scss'],
})
export class VideosPage implements OnInit {

  @ViewChild('video') myVideo?: ElementRef;
  @ViewChild('swiper') swiperRef: ElementRef | undefined;
  @ViewChildren("video") divs?: QueryList<any>

  currentIndex = 0;

  screenWidth = window.innerWidth;

  videoPostsList = [
    {
      id: '1',
      videoUrl: '../../../assets/videos/sampleVideo.mp4',
      songCasts: 'Arijit Singh , Shreya Ghosal',
      songName: 'Qaafirana',
      isLike: true,
      postLikes: '125K',
      postComments: '550',
      isPlay: false,
    },
    {
      id: '2',
      videoUrl: '../../../assets/videos/sampleVideo.mp4',
      songCasts: 'Arijit Singh , Shreya Ghosal',
      songName: 'Qaafirana',
      isLike: false,
      postLikes: '125K',
      postComments: '550',
      isPlay: false,
    },
    {
      id: '3',
      videoUrl: '../../../assets/videos/sampleVideo.mp4',
      songCasts: 'Arijit Singh , Shreya Ghosal',
      songName: 'Qaafirana',
      isLike: false,
      postLikes: '125K',
      postComments: '550',
      isPlay: false,
    },
    {
      id: '4',
      videoUrl: '../../../assets/videos/sampleVideo.mp4',
      songCasts: 'Arijit Singh , Shreya Ghosal',
      songName: 'Qaafirana',
      isLike: true,
      postLikes: '125K',
      postComments: '550',
      isPlay: false,
    },
    {
      id: '5',
      videoUrl: '../../../assets/videos/sampleVideo.mp4',
      songCasts: 'Arijit Singh , Shreya Ghosal',
      songName: 'Qaafirana',
      isLike: true,
      postLikes: '125K',
      postComments: '550',
      isPlay: false,
    },
  ];

  constructor(private router: Router, private navCtrl: NavController) { }

  ngOnInit() {
  }

  goBack() {
    this.navCtrl.back()
  }

  ionViewWillLeave() {
    this.divs?.map(div => {
      if (div.nativeElement.id == `video${this.currentIndex}`) {
        div?.nativeElement.pause();
        this.videoPostsList[this.currentIndex].isPlay = false;
      }
    });
  }

  ionViewWillEnter() {
    this.divs?.map(div => {
      if (div.nativeElement.id == `video${this.currentIndex}`) {
        this.videoPostsList[this.currentIndex].isPlay = false;
        div?.nativeElement.play();
      }
    });
  }

  ngAfterViewInit() {
    this.divs?.map(div => {
      if (div.nativeElement.id == `video0`) {
        div?.nativeElement.play();
      }
    });
  }

  toggleVideo(index: any) {
    this.divs?.map(div => {
      if (div.nativeElement.id == `video${index}`) {
        div?.nativeElement.paused ? div?.nativeElement.play() : div?.nativeElement.pause();
        if (!div?.nativeElement.paused) {
          this.videoPostsList[index].isPlay = false;
        }
        else {
          this.videoPostsList[index].isPlay = true;
        }
      }
    });
  }

  getStatus(index: any) {
    this.divs?.map(div => {
      if (div.nativeElement.id == `video${index}`) {
        return div?.nativeElement.paused
      }
    });
  }

  playVideo() {
    this.myVideo?.nativeElement.play();
  }

  stopVideo() {
    this.myVideo?.nativeElement.pause();
  }

  slideChangeCall() {
    const prevIndex = this.swiperRef?.nativeElement.swiper.previousIndex;
    const newIndex = this.swiperRef?.nativeElement.swiper.activeIndex;
    this.currentIndex = this.swiperRef?.nativeElement.swiper.activeIndex;
    this.divs?.map(div => {
      if (div.nativeElement.id == `video${prevIndex}`) {
        div?.nativeElement.pause();
      }
      if (div.nativeElement.id == `video${newIndex}`) {
        div?.nativeElement.play();
      }
    });
    this.videoPostsList[newIndex].isPlay = false;
  }

}
