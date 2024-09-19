import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
})
export class AboutPage implements OnInit {

  companyPolicies = [
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Diam ut blandit donec libero urna eu sodales gravida. Iaculis pharetra ullamcorper sed pulvinar vitae cursus semper.',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tortor sit ante tristique nisi venenatis purus nulla. Amet consequat ut est faucibus elementum venenatis hendrerit tempor. Urna, fermentum blandit congue eget imperdiet at amet magna nisi.',
  ];

  termsOfUses = [
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Diam ut blandit donec libero urna eu sodales gravida. Iaculis pharetra ullamcorper sed pulvinar vitae cursus semper.',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tortor sit ante tristique nisi venenatis purus nulla. Amet consequat ut est faucibus elementum venenatis hendrerit tempor. Urna, fermentum blandit congue eget imperdiet at amet magna nisi.',
  ];

  constructor(private navCtrl: NavController) { }

  ngOnInit() {
  }

  goBack() {
    this.navCtrl.back()
  }

}
