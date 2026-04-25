import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  output,
  ViewChild,
} from '@angular/core';
import { AnimationController, GestureController } from '@ionic/angular';
import { IonItem } from '@ionic/angular/standalone';
import { NotificationItem } from '../../models/notification.model';
import { FollowingNotificationComponent } from '../notification-types/following-notification/following-notification.component';
import { LikePhotosNotificationComponent } from '../notification-types/like-photos-notification/like-photos-notification.component';
import { LikeSingleNotificationComponent } from '../notification-types/like-single-notification/like-single-notification.component';
import { MemoryNotificationComponent } from '../notification-types/memory-notification/memory-notification.component';
import { MentionNotificationComponent } from '../notification-types/mention-notification/mention-notification.component';
import { MultiLikeNotificationComponent } from '../notification-types/multi-like-notification/multi-like-notification.component';

@Component({
  selector: 'app-notification-item',
  template: `
    <div class="notification-item__wrapper" #wrapper></div>
    <ion-item
      #item
      mode="ios"
      lines="none"
      color="whiteColor"
      class="notification-item"
    >
      <div class="notification-item__content-wrapper">
        @switch (notification().type) { @case ('following') {
        <app-following-notification
          [userProfilePic]="notification().userProfilePic!"
          [userName]="notification().userName!"
          [notificationTime]="notification().notificationTime"
        />
        } @case ('likeMorePhotos') {
        <app-like-photos-notification
          [userProfilePic]="notification().userProfilePic!"
          [userName]="notification().userName!"
          [likedPhotos]="notification().likedPohotos!"
          [notificationTime]="notification().notificationTime"
        />
        } @case ('likeOnePhoto') {
        <app-like-single-notification
          [userProfilePic]="notification().userProfilePic!"
          [userName]="notification().userName!"
          [likedPhoto]="notification().likedPhoto!"
          [notificationTime]="notification().notificationTime"
        />
        } @case ('mention') {
        <app-mention-notification
          [userProfilePic]="notification().userProfilePic!"
          [userName]="notification().userName!"
          [mentionUserName]="notification().mantionUserName!"
          [comment]="notification().comment!"
          [mentionPhoto]="notification().mentionPhoto!"
          [notificationTime]="notification().notificationTime"
        />
        } @case ('likeByMore') {
        <app-multi-like-notification
          [userProfilePics]="notification().userProfilePics!"
          [userProfileNames]="notification().userProfileNames!"
          [likedPhoto]="notification().likedPhoto!"
          [notificationTime]="notification().notificationTime"
        />
        } @case ('seeOldPost') {
        <app-memory-notification
          [postTime]="notification().postTime!"
          [seeTime]="notification().seeTime!"
          [post]="notification().post!"
          [notificationTime]="notification().notificationTime"
        />
        } }

        <div class="notification-item__divider"></div>
      </div>
    </ion-item>
  `,
  styleUrls: ['./notification-item.component.scss'],
  host: {
    '[style.--notification-item-width.px]': 'width',
  },
  imports: [
    IonItem,
    FollowingNotificationComponent,
    LikePhotosNotificationComponent,
    LikeSingleNotificationComponent,
    MentionNotificationComponent,
    MultiLikeNotificationComponent,
    MemoryNotificationComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationItemComponent implements AfterViewInit {
  notification = input.required<NotificationItem>();

  delete = output<void>();

  @ViewChild('item', { read: ElementRef }) item?: ElementRef<HTMLElement>;
  @ViewChild('wrapper', { read: ElementRef }) wrapper?: ElementRef<HTMLElement>;

  private readonly gestureCtrl = inject(GestureController);
  private readonly animationCtrl = inject(AnimationController);

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
            this.delete.emit();
          });
        } else if (ev.deltaX < -animationBreakpoint) {
          style.transform = `translate3d(-${windowWidth}px, 0, 0)`;
          this.deleteAnimation?.play();
          this.deleteAnimation?.onFinish(() => {
            this.delete.emit();
          });
        } else {
          style.transform = '';
        }
      },
    });
    moveGesture.enable(true);
  }
}
