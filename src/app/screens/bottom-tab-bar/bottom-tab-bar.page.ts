import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { IonRouterOutlet, MenuController, Platform, PopoverController } from '@ionic/angular';
import { Subject, filter, takeUntil } from 'rxjs';

@Component({
  selector: 'app-bottom-tab-bar',
  templateUrl: './bottom-tab-bar.page.html',
  styleUrls: ['./bottom-tab-bar.page.scss'],
})

export class BottomTabBarPage implements OnInit {

  closed$ = new Subject<any>();
  showTabs = true;
  selectedIndex = 1;
  showDialog = false;
  showDrawer = false;

  constructor(private routerOutlet: IonRouterOutlet, public platform: Platform, private router: Router, private popOverCtrl: PopoverController, private menuCtrl: MenuController) {
  }

  ionViewDidEnter() {
    this.routerOutlet.swipeGesture = false;
  }

  ionViewWillLeave() {
    this.routerOutlet.swipeGesture = true;
  }

  ngOnInit() {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      takeUntil(this.closed$)
    ).subscribe((event: any) => {
      if (event['url'] === '/bottom-tab-bar/create-post') {
        this.showTabs = false;
      }
      else {
        this.showTabs = true;
      }
      if (event['url'] === '/bottom-tab-bar/profile') {
        this.showDrawer = true
      }
      else {
        this.showDrawer = false
      }
    });
  }

  goTo(screen: any) {
    this.router.navigateByUrl(screen)
  }

  closeDrawer() {
    this.menuCtrl.close()
  }

  logout() {
    this.popOverCtrl.dismiss();
    this.menuCtrl.close();
    this.router.navigateByUrl('/auth/sign-in');
  }
}
