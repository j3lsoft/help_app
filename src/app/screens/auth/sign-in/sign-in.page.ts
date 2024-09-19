import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonRouterOutlet } from '@ionic/angular';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.page.html',
  styleUrls: ['./sign-in.page.scss'],
})
export class SignInPage implements OnInit {

  email = '';
  password = '';
  showPassword = false;

  constructor(private router: Router, private routerOutlet: IonRouterOutlet) { }

  ngOnInit() {
  }

  ionViewDidEnter() {
    this.routerOutlet.swipeGesture = false;
  }

  ionViewWillLeave() {
    this.routerOutlet.swipeGesture = true;
  }

  goTo(screen: any) {
    this.router.navigateByUrl(screen);
  }

}
