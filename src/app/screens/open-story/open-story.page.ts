import { Component, inject, OnInit } from '@angular/core';
import { IonicModule, NavController, Platform } from '@ionic/angular';

@Component({
  selector: 'app-open-story',
  templateUrl: './open-story.page.html',
  styleUrls: ['./open-story.page.scss'],
  imports: [IonicModule],
})
export class OpenStoryPage implements OnInit {
  public progress = 0;
  isMessageFocus = false;
  interval: any;
  public platform = inject(Platform);
  private navCtrl = inject(NavController);

  ngOnInit() {
    this.interval = setInterval(() => {
      this.isMessageFocus ? null : (this.progress += 0.01);
      if (this.progress > 1) {
        this.goBack();
      }
    }, 50);
  }

  goBack() {
    clearInterval(this.interval);
    this.navCtrl.back();
  }
}
