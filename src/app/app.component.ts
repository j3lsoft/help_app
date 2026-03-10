import { Location } from '@angular/common';
import { Component, inject } from '@angular/core';
import { App } from '@capacitor/app';
import { StatusBar } from '@capacitor/status-bar';
import { NavController, Platform } from '@ionic/angular';
import { register } from 'swiper/element/bundle';
import { IonApp, IonRouterOutlet, IonText } from '@ionic/angular/standalone';

register();

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [IonApp, IonRouterOutlet, IonText],
})
export class AppComponent {
  tap = 0;

  private readonly platform = inject(Platform);
  private readonly location = inject(Location);
  private readonly navCtrl = inject(NavController);

  constructor() {
    this.intializeApp();
    this.backButtonEvent();
  }

  backButtonEvent(): void {
    this.platform.backButton.subscribeWithPriority(10, () => {
      if (
        this.location.isCurrentPathEqualTo('/auth/login') ||
        this.location.isCurrentPathEqualTo('/bottom-tab-bar/home') ||
        this.location.isCurrentPathEqualTo('/bottom-tab-bar/notifications') ||
        this.location.isCurrentPathEqualTo('/bottom-tab-bar/message') ||
        this.location.isCurrentPathEqualTo('/bottom-tab-bar/profile') ||
        this.location.isCurrentPathEqualTo('/auth/sign-in') ||
        this.location.isCurrentPathEqualTo('/onboarding')
      ) {
        this.tap++;
        if (this.tap === 2) {
          App.exitApp();
        } else {
          setTimeout(() => {
            this.tap = 0;
          }, 2000);
        }
      } else {
        this.navCtrl.back();
      }
    });
  }

  intializeApp() {
    this.platform.ready().then(() => {
      StatusBar.setBackgroundColor({ color: '#0683a0' });
    });
  }
}
