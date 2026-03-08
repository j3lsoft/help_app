import { Component, OnInit } from '@angular/core';
import { NavController, Platform, IonicModule } from '@ionic/angular';

@Component({
    selector: 'app-call',
    templateUrl: './call.page.html',
    styleUrls: ['./call.page.scss'],
    imports: [IonicModule],
})
export class CallPage implements OnInit {

  isMute = false;

  constructor(private navCtrl: NavController,public platform:Platform) { }

  ngOnInit() {
  }

  goBack() {
    this.navCtrl.back()
  }


}
