import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { AnimationController, GestureController } from '@ionic/angular';
import { IonImg, IonItem, IonText } from '@ionic/angular/standalone';

export interface NotificationItem {
  type: 'following' | 'likeMorePhotos' | 'likeOnePhoto' | 'mention' | 'likeByMore' | 'seeOldPost';
  userProfilePic: string;
  userName: string;
  notificationTime: string;
  likedPohotos: { photo: string }[];
  likedPhoto: string;
  mantionUserName: string;
  comment: string;
  mentionPhoto: string;
  userProfilePics: { userProfilePic: string }[];
  userProfileNames: string[];
  postTime: string;
  seeTime: string;
  post: string;
}

@Component({
  selector: 'app-swipe-item',
  templateUrl: './swipe-item.component.html',
  styleUrls: ['./swipe-item.component.scss'],
  host: {
    '[style.--swipe-item-width.px]': 'width',
  },
  imports: [IonItem, IonImg, IonText],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SwipeItemComponent implements AfterViewInit {
  @Input() noti!: NotificationItem;
  @Input() ind!: number;

  @Output() delete = new EventEmitter<boolean>();

  @ViewChild('item', { read: ElementRef }) item?: ElementRef<HTMLElement>;
  @ViewChild('wrapper', { read: ElementRef }) wrapper?: ElementRef<HTMLElement>;

  private readonly gestureCtrl = inject(GestureController);
  private readonly animationCtrl = inject(AnimationController);
  private readonly router = inject(Router);

  width = 0;

  private deleteAnimation?: ReturnType<AnimationController['create']>;

  ngAfterViewInit(): void {
    this.width = window.innerWidth;
    const windowWidth = window.innerWidth;
    const animationBreakpoint = windowWidth - 100;

    const itemEl = this.item?.nativeElement;
    if (!itemEl) {
      return;
    }

    const style = itemEl.style;
    if (!style) {
      return;
    }

    this.deleteAnimation = this.animationCtrl
      .create('delete-animation')
      .addElement(itemEl)
      .duration(300)
      .easing('ease-out')
      .fromTo('height', '1', '0');

    const moveGesture = this.gestureCtrl.create({
      el: itemEl,
      gestureName: 'move',
      threshold: 0,
      onStart: (ev) => {
        style.transition = '';
      },
      onMove: (ev) => {
        itemEl.classList.add('rounded');
        if (ev.deltaX > 0) {
          style.transform = `translate3d(${ev.deltaX}px, 0, 0)`;
        } else if (ev.deltaX < 0) {
          style.transform = `translate3d(${ev.deltaX}px, 0, 0)`;
        }
      },
      onEnd: (ev) => {
        style.transition = '0.2s ease-out';
        itemEl.classList.remove('rounded');
        if (ev.deltaX > animationBreakpoint) {
          style.transform = `translate3d(${windowWidth}px, 0, 0)`;
          this.deleteAnimation?.play();
          this.deleteAnimation?.onFinish(() => {
            this.delete.emit(true);
          });
        } else if (ev.deltaX < -animationBreakpoint) {
          style.transform = `translate3d(-${windowWidth}px, 0, 0)`;
          this.deleteAnimation?.play();
          this.deleteAnimation?.onFinish(() => {
            this.delete.emit(true);
          });
        } else {
          style.transform = '';
        }
      },
    });
    moveGesture.enable(true);
  }

  goTo(screen: string): void {
    this.router.navigateByUrl(screen);
  }
}
