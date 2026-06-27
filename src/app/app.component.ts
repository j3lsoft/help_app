import { Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
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
  imports: [IonApp, IonRouterOutlet, IonText],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  readonly tap = signal(0);

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
          this.tap.update((count) => count + 1);
          if (this.tap() === 2) {
            App.exitApp();
          } else {
            setTimeout(() => {
              this.tap.set(0);
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

    // Give the browser a moment to paint the first frame
    await new Promise((resolve) => setTimeout(resolve, 100));

    await SplashScreen.hide();
  }
}
