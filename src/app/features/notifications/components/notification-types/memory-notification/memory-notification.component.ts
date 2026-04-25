import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { Router } from '@angular/router';
import { IonImg, IonText } from '@ionic/angular/standalone';

@Component({
  selector: 'app-memory-notification',
  template: `
    <div class="memory-notification__row">
      <div class="memory-notification__content-row">
        <div class="memory-notification__history-wrapper">
          <span class="material-icons memory-notification__history-icon">
            history
          </span>
        </div>
        <div class="memory-notification__content">
          <ion-text class="blackColor14SemiBold memory-notification__title">
            See your post from {{ postTime() }} {{ seeTime() }}
          </ion-text>
          <ion-text class="grayColor12Regular memory-notification__time">
            {{ notificationTime() }}
          </ion-text>
        </div>
      </div>
      <ion-img
        (click)="goTo('user-posts')"
        [src]="post()"
        class="memory-notification__thumbnail"
      ></ion-img>
    </div>
  `,
  styleUrls: ['./memory-notification.component.scss'],
  imports: [IonImg, IonText],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemoryNotificationComponent {
  private readonly router = inject(Router);

  postTime = input.required<string>();
  seeTime = input.required<string>();
  post = input.required<string>();
  notificationTime = input.required<string>();

  goTo(screen: string): void {
    this.router.navigateByUrl(screen);
  }
}
