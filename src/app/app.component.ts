import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';
import { StatusBar } from '@capacitor/status-bar';
import { AlertController, NavController, Platform } from '@ionic/angular';
import { register } from 'swiper/element/bundle';

register();

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  tap = 0;

  constructor(
    private platform: Platform,
    public alertController: AlertController,
    private router: Router,
    private location: Location,
    private navCtrl: NavController,
  ) {
    this.intializeApp();
    this.backButtonEvent();
  }

  backButtonEvent() {
    this.platform.backButton.subscribeWithPriority(10, (processNextHandler) => {
      if (this.location.isCurrentPathEqualTo('/auth/login') ||
        this.location.isCurrentPathEqualTo('/bottom-tab-bar/home') ||
        this.location.isCurrentPathEqualTo('/bottom-tab-bar/notifications') ||
        this.location.isCurrentPathEqualTo('/bottom-tab-bar/message') ||
        this.location.isCurrentPathEqualTo('/bottom-tab-bar/profile') ||
        this.location.isCurrentPathEqualTo('/auth/sign-in') ||
        this.location.isCurrentPathEqualTo('/onboarding')
      ) {
        this.tap++;
        if (this.tap == 2) {
          App.exitApp();
        }
        else {
          setTimeout(() => {
            this.tap = 0;
          }, 2000);
        }
      }
      else {
        this.navCtrl.back();
      }
    });
  }

  intializeApp() {
    this.platform.ready().then(() => {
      StatusBar.setBackgroundColor({ color: '#0683a0' });
    })
  }
}
