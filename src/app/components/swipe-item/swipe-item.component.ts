import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AnimationController, GestureController, IonItem, } from '@ionic/angular';

const ANIMATION_BREAKPOINT = window.innerWidth - 100;

@Component({
  selector: 'app-swipe-item',
  templateUrl: './swipe-item.component.html',
  styleUrls: ['./swipe-item.component.scss'],
})

export class SwipeItemComponent implements AfterViewInit {

  @Input('noti') noti: any;
  @Input('ind') index: any;

  @ViewChild(IonItem, { read: ElementRef }) item?: ElementRef;
  @ViewChild('wrapper') wrapper: any;

  @Output() delete: EventEmitter<any> = new EventEmitter();

  width=window.innerWidth;

  deleteAnimation: any;

  constructor(
    private gestureCtrl: GestureController,
    private animationCtrl: AnimationController,
    private router:Router,
  ) { }

  ngAfterViewInit() {

    const style = this.item?.nativeElement.style;
    const windowWidth = window.innerWidth;

    this.deleteAnimation = this.animationCtrl
      .create('delete-animation')
      .addElement(this.item?.nativeElement)
      .duration(300)
      .easing('ease-out')
      .fromTo('height', '1', '0');

    const moveGesture = this.gestureCtrl.create({
      el: this.item?.nativeElement,
      gestureName: 'move',
      threshold: 0,
      onStart: (ev) => {
        style.transition = '';
      },
      onMove: (ev) => {
        this.item?.nativeElement.classList.add('rounded');
        if (ev.deltaX > 0) {
          style.transform = `translate3d(${ev.deltaX}px, 0, 0)`;

        } else if (ev.deltaX < 0) {
          style.transform = `translate3d(${ev.deltaX}px, 0, 0)`;
        }
      },
      onEnd: (ev) => {
        style.transition = '0.2s ease-out';
        this.item?.nativeElement.classList.remove('rounded');
        if (ev.deltaX > ANIMATION_BREAKPOINT) {
          style.transform = `translate3d(${windowWidth}px, 0, 0)`;
          this.deleteAnimation.play();
          this.deleteAnimation.onFinish(() => {
            this.delete.emit(true);
          });
        } else if (ev.deltaX < -ANIMATION_BREAKPOINT) {
          style.transform = `translate3d(-${windowWidth}px, 0, 0)`;
          this.deleteAnimation.play();
          this.deleteAnimation.onFinish(() => {
            this.delete.emit(true);
          });
        } else {
          style.transform = '';
        }
      }
    });
    moveGesture.enable(true);
  }

  goTo(screen:any){
    this.router.navigateByUrl(screen);
  }

}
