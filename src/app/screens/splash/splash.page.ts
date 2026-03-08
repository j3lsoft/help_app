import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
    selector: 'app-splash',
    templateUrl: './splash.page.html',
    styleUrls: ['./splash.page.scss'],
    imports: [IonicModule],
})
export class SplashPage implements OnInit {

  constructor(private router:Router) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.router.navigateByUrl('onboarding')
    }, 2000);
  }

}
