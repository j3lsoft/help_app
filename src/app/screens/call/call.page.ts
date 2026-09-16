import { Component, inject } from '@angular/core';
import { IonicModule, NavController, Platform } from '@ionic/angular';

@Component({
  selector: 'app-call',
  templateUrl: './call.page.html',
  styleUrls: ['./call.page.scss'],
  imports: [IonicModule],
})
export class CallPage {
  isMute = false;
  private navCtrl = inject(NavController);
  public platform = inject(Platform);

  goBack() {
    this.navCtrl.back();
  }
}
