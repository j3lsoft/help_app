import { Component, OnInit } from '@angular/core';
import { NavController, Platform } from '@ionic/angular';

@Component({
  selector: 'app-call',
  templateUrl: './call.page.html',
  styleUrls: ['./call.page.scss'],
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
