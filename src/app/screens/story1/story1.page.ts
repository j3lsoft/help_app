import { NgFor, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, NavController, Platform } from '@ionic/angular';

@Component({
  selector: 'app-story1',
  templateUrl: './story1.page.html',
  styleUrls: ['./story1.page.scss'],
  imports: [IonicModule, NgIf, FormsModule, NgFor],
})
export class Story1Page {
  public platform = inject(Platform);
  private navCtrl = inject(NavController);
  private router = inject(Router);

  colorsList = [
    {
      id: '1',
      colors: ['#00D2FF', '#3A7BD5'],
    },
    {
      id: '2',
      colors: ['#00F5A0', '#00D9F5'],
    },
    {
      id: '3',
      colors: ['#C84E89', '#F15F79'],
    },
    {
      id: '4',
      colors: ['#9400D3', '#4B0082'],
    },
    {
      id: '5',
      colors: ['#0052D4', '#6FB1FC'],
    },
    {
      id: '6',
      colors: ['#FFE000', '#799F0C'],
    },
    {
      id: '7',
      colors: ['#603813', '#B29F94'],
    },
  ];

  isDone = false;
  selectedColors: any = this.colorsList[0].colors;
  story = 'Hello 🖐';

  goBack() {
    this.navCtrl.back();
  }

  goTo(screen: any) {
    this.router.navigateByUrl(screen);
  }

  ionViewWillEnter() {
    this.isDone = false;
    this.selectedColors = this.colorsList[0].colors;
    this.story = 'Hello 🖐';
  }
}
