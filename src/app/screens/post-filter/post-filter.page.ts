import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonRouterOutlet, NavController } from '@ionic/angular';

@Component({
  selector: 'app-post-filter',
  templateUrl: './post-filter.page.html',
  styleUrls: ['./post-filter.page.scss'],
})
export class PostFilterPage implements OnInit {

  imageUrl: any;
  selectedTabValue = 'Filter';
  filtersList = [
    {
      filterName: 'Normal',
      filter: '',
    },
    {
      filterName: 'Gingham',
      filter: 'grayscale(100%)',
    },
    {
      filterName: 'Lark',
      filter: 'saturate(3)',
    },
    {
      filterName: 'Clarendon',
      filter: 'sepia(100%)',
    },
    {
      filterName: 'Skyline',
      filter: 'hue-rotate(100deg)',
    },
    {
      filterName: 'Moon',
      filter: 'invert(90%)',
    },
    {
      filterName: 'Juno',
      filter: 'hue-rotate(200deg)',
    },
  ];
  selectedFilter: any = this.filtersList[0].filter;

  editOptionsList = [
    {
      id: '1',
      editOptionIcom: '../../../assets/images/icons/adjust.png',
      optionName: 'Adjust'
    },
    {
      id: '2',
      editOptionIcom: '../../../assets/images/icons/brightness.png',
      optionName: 'Brightness'
    },
    {
      id: '3',
      editOptionIcom: '../../../assets/images/icons/contrast.png',
      optionName: 'Contrast'
    },
    {
      id: '4',
      editOptionIcom: '../../../assets/images/icons/curves.png',
      optionName: 'Curves'
    },
    {
      id: '5',
      editOptionIcom: '../../../assets/images/icons/crop.png',
      optionName: 'Crop'
    },
    {
      id: '6',
      editOptionIcom: '../../../assets/images/icons/rotate.png',
      optionName: 'Rotate'
    },
    {
      id: '7',
      editOptionIcom: '../../../assets/images/icons/blur.png',
      optionName: 'Blur'
    },
    {
      id: '8',
      editOptionIcom: '../../../assets/images/icons/perspective.png',
      optionName: 'Perspective'
    },
  ];

  constructor(private router: Router, private route: ActivatedRoute, private navCtrl: NavController) { }

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
    this.router.navigate(['/', screen, this.imageUrl])
  }

  onFilterUpdate(event: any) {
    this.selectedTabValue = event.detail.value
  }

}
