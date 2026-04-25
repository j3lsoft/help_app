import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IonImg, IonText } from '@ionic/angular/standalone';

@Component({
  selector: 'app-following-notification',
  template: `
    <div class="following-notification__row">
      <ion-img
        [src]="userProfilePic()"
        class="following-notification__avatar"
      ></ion-img>
      <div class="following-notification__content">
        <ion-text class="blackColor14SemiBold following-notification__title">
          {{ userName() }} started following you
        </ion-text>
        <ion-text class="grayColor12Regular following-notification__time">
          {{ notificationTime() }}
        </ion-text>
      </div>
    </div>
  `,
  styleUrls: ['./following-notification.component.scss'],
  imports: [IonImg, IonText],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FollowingNotificationComponent {
  userProfilePic = input.required<string>();
  userName = input.required<string>();
  notificationTime = input.required<string>();
}
