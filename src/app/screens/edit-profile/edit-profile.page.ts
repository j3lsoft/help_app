import { Component, OnInit } from '@angular/core';
import { ModalController, NavController, Platform } from '@ionic/angular';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
})
export class EditProfilePage implements OnInit {

  name = 'Samantha Smith';
  userName = 'samanthaofficial';
  email = 'smithsamantha@gmail.com';
  phoneNumber = '+91 1236547890';
  description = 'Samantha Smith\nArtist\nFind me on @samantha___\nArt + Prints + Workshops\nWebsite: www.officialsamantha.com';

  constructor(private navCtrl: NavController, public platform: Platform, private modalCtrl: ModalController) { }

  ngOnInit() {
  }

  goBack() {
    this.navCtrl.back()
  }

  closeSheet() {
    this.modalCtrl.dismiss()
  }

}
