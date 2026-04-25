import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { Router } from '@angular/router';
import { IonImg, IonText } from '@ionic/angular/standalone';

@Component({
  selector: 'app-like-single-notification',
  template: `
    <div class="like-single-notification__row">
      <ion-img
        [src]="userProfilePic()"
        class="like-single-notification__avatar"
      ></ion-img>
      <div class="like-single-notification__content">
        <ion-text class="blackColor14SemiBold like-single-notification__title">
          {{ userName() }} liked your photo
        </ion-text>
        <ion-text class="grayColor12Regular like-single-notification__time">
          {{ notificationTime() }}
        </ion-text>
      </div>
      <ion-img
        (click)="goTo('user-posts')"
        [src]="likedPhoto()"
        class="like-single-notification__thumbnail"
      ></ion-img>
    </div>
  `,
  styleUrls: ['./like-single-notification.component.scss'],
  imports: [IonImg, IonText],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LikeSingleNotificationComponent {
  private readonly router = inject(Router);

  userProfilePic = input.required<string>();
  userName = input.required<string>();
  likedPhoto = input.required<string>();
  notificationTime = input.required<string>();

  goTo(screen: string): void {
    this.router.navigateByUrl(screen);
  }
}
