import { Component, inject } from '@angular/core';
import { IonicModule, NavController, Platform } from '@ionic/angular';

@Component({
  selector: 'app-video-call',
  templateUrl: './video-call.page.html',
  styleUrls: ['./video-call.page.scss'],
  imports: [IonicModule],
})
export class VideoCallPage {
  isMute = false;
  private navCtrl = inject(NavController);
  public platform = inject(Platform);

  goBack() {
    this.navCtrl.back();
  }
}
