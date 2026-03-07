import { Component, OnInit } from '@angular/core';
import { NavController, Platform, IonicModule } from '@ionic/angular';

@Component({
    selector: 'app-video-call',
    templateUrl: './video-call.page.html',
    styleUrls: ['./video-call.page.scss'],
    standalone: true,
    imports: [IonicModule],
})
export class VideoCallPage implements OnInit {

  isMute = false;

  constructor(private navCtrl: NavController,public platform:Platform) { }

  ngOnInit() {
  }

  goBack() {
    this.navCtrl.back()
  }

}
