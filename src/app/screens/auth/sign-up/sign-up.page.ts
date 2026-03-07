import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController, IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-sign-up',
    templateUrl: './sign-up.page.html',
    styleUrls: ['./sign-up.page.scss'],
    standalone: true,
    imports: [IonicModule, FormsModule],
})
export class SignUpPage implements OnInit {

  email = '';
  name = '';
  phoneNumber = '';
  password = '';
  confirmPwd = '';
  showPassword = false;
  showConfirmPwd = false;

  constructor(private navCtrl: NavController, private router: Router) { }

  ngOnInit() {
  }

  goBack() {
    this.navCtrl.back()
  }

  goTo(screen: any) {
    this.router.navigateByUrl(screen);
  }

}
