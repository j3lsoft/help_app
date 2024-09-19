import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController, PopoverController } from '@ionic/angular';
import { NgOtpInputConfig } from 'ng-otp-input';

@Component({
  selector: 'app-verification',
  templateUrl: './verification.page.html',
  styleUrls: ['./verification.page.scss'],
})

export class VerificationPage implements OnInit {

  showLoadingDialog = false;
  otpValue = '0';
  config: NgOtpInputConfig = {
    length: 4,
    allowNumbersOnly: true,
    inputStyles: {
      'height': '40px',
      'width': '40px',
      'border-radius': '5px',
      'color': 'white',
      'font-size':'18px',
      'font-weight':'700',
      'background': 'transparent',
      'border-width': '0',
    },
    inputClass: 'each_input',
    containerStyles: { 'justify-content': 'space-between', 'display': 'flex', 'margin': '20px' }
  }

  constructor(private navCtrl: NavController, private router: Router,private popCtrl:PopoverController) { }

  ngOnInit() {
  }

  goBack() {
    this.navCtrl.back()
  }

  goTo(screen: any) {
    this.router.navigateByUrl(screen);
  }

  onContinue() {
    this.showLoadingDialog = true
    setTimeout(() => {
      this.showLoadingDialog = false;
      this.popCtrl.dismiss();
      this.router.navigateByUrl('/bottom-tab-bar/home')
    }, 2000);
  }

  onChange(event: any) {
    this.otpValue = event;
    if (event.length === 4) {
      this.showLoadingDialog = true
      setTimeout(() => {
        this.showLoadingDialog = false;
        this.popCtrl.dismiss();
        this.router.navigateByUrl('/bottom-tab-bar/home')
      }, 2000);
    }
  }


}
