import { Component, Input, OnInit } from '@angular/core';
import { NavController, IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-account-privacy',
    templateUrl: './account-privacy.page.html',
    styleUrls: ['./account-privacy.page.scss'],
    imports: [IonicModule, FormsModule],
})
export class AccountPrivacyPage implements OnInit {

  privateAccount='true';
  showMore=false;

  text: string = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptat velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint';

  constructor(private navCtrl: NavController) { }

  ngOnInit() {
  }

  goBack() {
    this.navCtrl.back()
  }
}
