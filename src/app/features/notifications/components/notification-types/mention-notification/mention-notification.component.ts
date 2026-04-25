import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { Router } from '@angular/router';
import { IonImg, IonText } from '@ionic/angular/standalone';

@Component({
  selector: 'app-mention-notification',
  template: `
    <div class="mention-notification__row">
      <ion-img
        [src]="userProfilePic()"
        class="mention-notification__avatar"
      ></ion-img>
      <div class="mention-notification__content">
        <ion-text class="blackColor14Bold mention-notification__title">
          {{ userName() }}
          <ion-text class="blackColor14SemiBold">
            mentioned you in a commented :
          </ion-text>
          <ion-text class="blueColor14SemiBold">
            {{ mentionUserName() }}
          </ion-text>
          <ion-text class="blackColor14SemiBold">
            {{ comment() }}
          </ion-text>
        </ion-text>
        <ion-text class="grayColor12Regular mention-notification__time">
          {{ notificationTime() }}
        </ion-text>
      </div>
      <ion-img
        (click)="goTo('comments')"
        [src]="mentionPhoto()"
        class="mention-notification__thumbnail"
      ></ion-img>
    </div>
  `,
  styleUrls: ['./mention-notification.component.scss'],
  imports: [IonImg, IonText],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MentionNotificationComponent {
  private readonly router = inject(Router);

  userProfilePic = input.required<string>();
  userName = input.required<string>();
  mentionUserName = input.required<string>();
  comment = input.required<string>();
  mentionPhoto = input.required<string>();
  notificationTime = input.required<string>();

  goTo(screen: string): void {
    this.router.navigateByUrl(screen);
  }
}
