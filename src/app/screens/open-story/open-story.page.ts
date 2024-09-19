import { Component, OnInit } from '@angular/core';
import { NavController, Platform } from '@ionic/angular';

@Component({
  selector: 'app-open-story',
  templateUrl: './open-story.page.html',
  styleUrls: ['./open-story.page.scss'],
})
export class OpenStoryPage implements OnInit {

  public progress = 0;
  isMessageFocus = false;
  interval:any;

  constructor(public platform: Platform, private navCtrl: NavController) {
   this.interval= setInterval(() => {
      this.isMessageFocus ? null : this.progress += 0.01;
      if (this.progress > 1) {
        this.goBack()
      }
    }, 50);
  }

  ngOnInit() {
  }

  goBack() {
    clearInterval(this.interval)
    this.navCtrl.back()
  }

}
