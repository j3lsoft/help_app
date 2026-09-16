import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';

@Component({
  selector: 'app-account-privacy',
  templateUrl: './account-privacy.page.html',
  styleUrls: ['./account-privacy.page.scss'],
  imports: [IonicModule, FormsModule],
})
export class AccountPrivacyPage {
  private navCtrl = inject(NavController);

  privateAccount = 'true';
  showMore = false;

  text: string =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptat velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint';

  goBack() {
    this.navCtrl.back();
  }
}
