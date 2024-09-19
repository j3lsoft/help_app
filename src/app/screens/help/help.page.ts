import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-help',
  templateUrl: './help.page.html',
  styleUrls: ['./help.page.scss'],
})
export class HelpPage implements OnInit {

  topicDetails = [
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Risus penatibus amet tincidunt rhoncus gravida justo, sed non.',
    'Faucibus dignissim eget lacus at. Eget a pretium nunc id. Netus nulla ac odio bibendum tortor facilisis nibh porta quam. Tincidunt gravida scelerisque at nibh sollicitudin purus. Nisl eget viverra et, amet pellentesque congue. Aliquam interdum id semper bibendum.',
    'Faucibus dignissim eget lacus at. Eget a pretium nunc id. Netus nulla ac odio bibendum tortor facilisis nibh porta quam sit.'
  ];

  popularTopicsList = [
    {
      id: '1',
      topic: 'Managing your account',
      topicDetail: this.topicDetails,
    },
    {
      id: '2',
      topic: 'Using social media',
      topicDetail: this.topicDetails,
    },
    {
      id: '3',
      topic: 'Managing your account',
      topicDetail: this.topicDetails,
    },
    {
      id: '4',
      topic: 'Troubleshooting and login help',
      topicDetail: this.topicDetails,
    },
    {
      id: '5',
      topic: 'Learn about privacy settings',
      topicDetail: this.topicDetails,
    },
    {
      id: '6',
      topic: 'Controlling your visibility',
      topicDetail: this.topicDetails,
    },
    {
      id: '7',
      topic: 'Blocking people',
      topicDetail: this.topicDetails,
    },
    {
      id: '8',
      topic: 'Report something',
      topicDetail: this.topicDetails,
    },
  ];

  constructor(private navCtrl: NavController,private router:Router) { }

  ngOnInit() {
  }

  goBack() {
    this.navCtrl.back()
  }

  goToHelpDetail(title:any) {
    this.router.navigate(['/', 'help-detail', title])
  }


}
