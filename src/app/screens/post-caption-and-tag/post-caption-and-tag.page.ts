import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonRouterOutlet, NavController } from '@ionic/angular';

@Component({
  selector: 'app-post-caption-and-tag',
  templateUrl: './post-caption-and-tag.page.html',
  styleUrls: ['./post-caption-and-tag.page.scss'],
})
export class PostCaptionAndTagPage implements OnInit {

  imageUrl: any;

  constructor( private router: Router, private route: ActivatedRoute, private navCtrl: NavController) { }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (paramMap.has('imageUrl')) {
        this.imageUrl = `${paramMap.get('imageUrl')}`
      }
    });
  }

  goBack() {
    this.navCtrl.back()
  }

  goTo(screen: any) {
    this.router.navigateByUrl(screen);
  }

}
