import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { MenuController, Platform, PopoverController } from '@ionic/angular';
import {
  IonContent,
  IonHeader,
  IonIcon,
  IonMenu,
  IonPopover,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonText,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  add,
  chatbubbleEllipsesOutline,
  closeCircleOutline,
  homeOutline,
  notificationsOutline,
  personOutline,
} from 'ionicons/icons';
import { filter } from 'rxjs';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  imports: [
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonMenu,
    IonHeader,
    IonToolbar,
    IonText,
    IonContent,
    IonPopover,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsPage {
  public readonly platform = inject(Platform);
  private readonly router = inject(Router);
  private readonly popOverCtrl = inject(PopoverController);
  private readonly menuCtrl = inject(MenuController);

  private readonly navigationEnd = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd)
    )
  );

  readonly showTabs = computed(() => {
    const url = this.navigationEnd()?.urlAfterRedirects || this.router.url;
    return !url.includes('/create-post');
  });

  readonly showDrawer = computed(() => {
    const url = this.navigationEnd()?.urlAfterRedirects || this.router.url;
    return url.includes('/profile');
  });

  readonly showDialog = signal(false);

  constructor() {
    addIcons({
      homeOutline,
      notificationsOutline,
      chatbubbleEllipsesOutline,
      personOutline,
      closeCircleOutline,
      add,
    });
  }

  goTo(screen: string): void {
    this.router.navigateByUrl(screen);
  }

  closeDrawer(): void {
    this.menuCtrl.close();
  }

  logout(): void {
    this.showDialog.set(false);
    this.popOverCtrl.dismiss();
    this.menuCtrl.close();
    this.router.navigateByUrl('/auth/sign-in');
  }
}
