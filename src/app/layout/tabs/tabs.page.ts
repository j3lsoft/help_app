import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from '@features/auth/services/auth.service';
import {
  IonContent,
  IonHeader,
  IonIcon,
  IonMenu,
  IonPopover,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonText,
  IonToolbar,
  MenuController,
  Platform,
  PopoverController,
  ViewWillEnter,
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
  standalone: true,
  imports: [
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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsPage implements ViewWillEnter {
  @ViewChild(IonTabs) private tabs?: IonTabs;

  public readonly platform = inject(Platform);
  private readonly router = inject(Router);
  private readonly popOverCtrl = inject(PopoverController);
  private readonly menuCtrl = inject(MenuController);
  private readonly authService = inject(AuthService);

  /**
   * Ionic only re-fires the enter lifecycle on the tabs container when coming
   * back from a root-level route (e.g. `post-detail`); the child page of the
   * active tab never left its own outlet, so it stays stale. On the first
   * entry the child already got its normal event, so only propagate after that.
   */
  private hasEntered = false;

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

  ionViewWillEnter(): void {
    if (this.hasEntered) {
      this.propagateEnterToActiveTab();
    }
    this.hasEntered = true;
  }

  /**
   * Re-dispatches the enter lifecycle on the active tab's last route view.
   * `bindLifecycleEvents` in `@ionic/angular` listens for these DOM events and
   * calls the page's own hook, so no page needs to know about this.
   */
  private propagateEnterToActiveTab(): void {
    const outlet = this.tabs?.outlet as IonRouterOutlet | undefined;
    const stackId = outlet?.getActiveStackId();
    const element = outlet?.getLastRouteView(stackId)?.element;
    if (!element) {
      return;
    }
    element.dispatchEvent(new CustomEvent('ionViewWillEnter'));
    element.dispatchEvent(new CustomEvent('ionViewDidEnter'));
  }

  goTo(screen: string): void {
    this.router.navigateByUrl(screen);
  }

  closeDrawer(): void {
    this.menuCtrl.close();
  }

  async logout(): Promise<void> {
    this.showDialog.set(false);
    await this.popOverCtrl.dismiss();
    await this.menuCtrl.close();
    await this.authService.logout();
  }
}
