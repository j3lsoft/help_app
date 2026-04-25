import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { Router } from '@angular/router';
import { IonImg, IonText } from '@ionic/angular/standalone';
import { UserProfilePic } from '../../../models/notification.model';

@Component({
  selector: 'app-multi-like-notification',
  template: `
    <div class="multi-like-notification__row">
      <div class="multi-like-notification__content-row">
        <div class="multi-like-notification__avatar-stack">
          <div class="multi-like-notification__avatar-stack-inner">
            <ion-img
              class="multi-like-notification__avatar-stack-primary"
              [src]="userProfilePics()[0].userProfilePic"
            ></ion-img>
            <ion-img
              class="multi-like-notification__avatar-stack-secondary"
              [src]="userProfilePics()[1].userProfilePic"
            ></ion-img>
          </div>
        </div>
        <div class="multi-like-notification__content">
          <ion-text class="blackColor14SemiBold multi-like-notification__title">
            {{ userProfileNames()[0] }} , {{ userProfileNames()[1] }} and
            {{ userProfileNames().length - 2 }} others liked your photo
          </ion-text>
          <ion-text class="grayColor12Regular multi-like-notification__time">
            {{ notificationTime() }}
          </ion-text>
        </div>
      </div>
      <ion-img
        (click)="goTo('user-posts')"
        [src]="likedPhoto()"
        class="multi-like-notification__thumbnail"
      ></ion-img>
    </div>
  `,
  styleUrls: ['./multi-like-notification.component.scss'],
  imports: [IonImg, IonText],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiLikeNotificationComponent {
  private readonly router = inject(Router);

  userProfilePics = input.required<UserProfilePic[]>();
  userProfileNames = input.required<string[]>();
  likedPhoto = input.required<string>();
  notificationTime = input.required<string>();

  goTo(screen: string): void {
    this.router.navigateByUrl(screen);
  }
}
