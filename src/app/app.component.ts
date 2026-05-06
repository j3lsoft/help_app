import { Location } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { App } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { NavController, Platform } from '@ionic/angular';
import { IonApp, IonRouterOutlet, IonText } from '@ionic/angular/standalone';
import { register } from 'swiper/element/bundle';
import { APP_EXIT_ROUTES } from './core/constants/routes.constants';
import { EdgeToEdgeService } from './core/services/edge-to-edge.service';

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
  private readonly destroyRef = inject(DestroyRef);
  private readonly edgeToEdgeService = inject(EdgeToEdgeService);

  constructor() {
    void this.initializeApp();
    this.setupBackButton();
  }

  private setupBackButton(): void {
    const subscription = this.platform.backButton.subscribeWithPriority(
      10,
      () => {
        if (
          APP_EXIT_ROUTES.some((route: string) =>
            this.location.isCurrentPathEqualTo(route)
          )
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
      }
    );

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }

  private async initializeApp(): Promise<void> {
    await this.edgeToEdgeService.initialize();
    await this.edgeToEdgeService.updateStyleFromTheme();
    await this.platform.ready();
    await SplashScreen.hide();
  }
}
