import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NavController } from '@ionic/angular';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-user-activity',
  templateUrl: './user-activity.page.html',
  styleUrls: ['./user-activity.page.scss'],
})
export class UserActivityPage implements OnInit {

  @ViewChild('barCanvas') private barCanvas: any;

  barChart: any;

  constructor(private navCtrl: NavController) { }

  ngOnInit() { }

  ngAfterViewInit() {
    this.barChartMethod();
  }

  barChartMethod() {
    const color1 = getComputedStyle(document.documentElement).getPropertyValue('--primaryColor');

    Chart.defaults.color = 'blackColor';

    this.barChart = new Chart(this.barCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        datasets: [{
          data: [30, 65, 40, 60, 10, 20, 50],
          backgroundColor: color1,
          barPercentage: 1.5,
          borderWidth: 0,
          borderRadius: 15,
          categoryPercentage: 0.6,
        }
        ]
      },
      options: {
        animations: {
          tension: {
            duration: 1000,
            easing: 'linear',
            from: 1,
            to: 0,
            loop: true
          }
        },
        scales: {
          y: {
            display: false,
            beginAtZero: true,
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: '#b7b7b7',
              font: {
                size: 16,
                family: 'OpenSans',
              }
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => `${context.raw}m`,
            },
            titleColor: 'white',
            titleFont: { size: 14, family: 'OpenSans' },
            bodyFont: { size: 14, family: 'OpenSans' },
            displayColors: false,
          }
        },

      },
    });
  }

  goBack() {
    this.navCtrl.back()
  }


}
