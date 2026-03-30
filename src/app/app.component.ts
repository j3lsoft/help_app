import { Location } from '@angular/common';
import { Component, inject } from '@angular/core';
import { App } from '@capacitor/app';
import { StatusBar } from '@capacitor/status-bar';
import { NavController, Platform } from '@ionic/angular';
import { IonApp, IonRouterOutlet, IonText } from '@ionic/angular/standalone';
import { register } from 'swiper/element/bundle';

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
    this.initializeApp();
    this.backButtonEvent();
  }

  backButtonEvent(): void {
    this.platform.backButton.subscribeWithPriority(10, () => {
      if (
        this.location.isCurrentPathEqualTo('/auth/login') ||
        this.location.isCurrentPathEqualTo('/tabs/home') ||
        this.location.isCurrentPathEqualTo('/tabs/notifications') ||
        this.location.isCurrentPathEqualTo('/tabs/message') ||
        this.location.isCurrentPathEqualTo('/tabs/profile') ||
        this.location.isCurrentPathEqualTo('/auth/sign-in') ||
        this.location.isCurrentPathEqualTo('/tabs/onboarding')
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

  initializeApp() {
    this.platform.ready().then(() => {
      StatusBar.setBackgroundColor({ color: '#0683a0' });
    });
  }
}
