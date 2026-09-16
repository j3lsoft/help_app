import { NgFor } from '@angular/common';
import { Component, inject } from '@angular/core';
import { IonicModule, NavController } from '@ionic/angular';

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
  imports: [IonicModule, NgFor],
})
export class AboutPage {
  private navCtrl = inject(NavController);

  companyPolicies = [
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Diam ut blandit donec libero urna eu sodales gravida. Iaculis pharetra ullamcorper sed pulvinar vitae cursus semper.',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tortor sit ante tristique nisi venenatis purus nulla. Amet consequat ut est faucibus elementum venenatis hendrerit tempor. Urna, fermentum blandit congue eget imperdiet at amet magna nisi.',
  ];

  termsOfUses = [
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Diam ut blandit donec libero urna eu sodales gravida. Iaculis pharetra ullamcorper sed pulvinar vitae cursus semper.',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tortor sit ante tristique nisi venenatis purus nulla. Amet consequat ut est faucibus elementum venenatis hendrerit tempor. Urna, fermentum blandit congue eget imperdiet at amet magna nisi.',
  ];

  goBack() {
    this.navCtrl.back();
  }
}
