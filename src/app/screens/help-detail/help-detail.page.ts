import { NgFor } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonicModule, NavController } from '@ionic/angular';

@Component({
  selector: 'app-help-detail',
  templateUrl: './help-detail.page.html',
  styleUrls: ['./help-detail.page.scss'],
  imports: [IonicModule, NgFor],
})
export class HelpDetailPage implements OnInit {
  private navCtrl = inject(NavController);
  private route = inject(ActivatedRoute);

  topicDescription = [
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Risus penatibus amet tincidunt rhoncus gravida justo, sed non.',
    'Faucibus dignissim eget lacus at. Eget a pretium nunc id. Netus nulla ac odio bibendum tortor facilisis nibh porta quam. Tincidunt gravida scelerisque at nibh sollicitudin purus. Nisl eget viverra et, amet pellentesque congue. Aliquam interdum id semper bibendum.',
    'Faucibus dignissim eget lacus at. Eget a pretium nunc id. Netus nulla ac odio bibendum tortor facilisis nibh porta quam sit.',
  ];

  topicTitle: any;

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap) => {
      if (paramMap.has('title')) {
        this.topicTitle = `${paramMap.get('title')}`;
      }
    });
  }

  goBack() {
    this.navCtrl.back();
  }
}
