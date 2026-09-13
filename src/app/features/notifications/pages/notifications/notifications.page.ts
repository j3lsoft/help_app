import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonIcon, IonText } from '@ionic/angular/standalone';
import { TopBarComponent } from '@shared/components/top-bar/top-bar.component';
import { addIcons } from 'ionicons';
import { notificationsOff } from 'ionicons/icons';
import { NotificationService } from '@core/services/notification.service';
import { FollowRequestCardComponent } from '../../components/follow-request-card/follow-request-card.component';
import { NotificationListComponent } from '../../components/notification-list/notification-list.component';
import { NotificationsService } from '../../services/notifications.service';

@Component({
  selector: 'app-notifications',
  template: `
    <app-top-bar title="Notifications"></app-top-bar>

    <ion-content>
      <app-follow-request-card [count]="255" />

      <div class="notifications-content">
        <app-notification-list
          [notifications]="notificationsService.notifications()"
          (delete)="removeNotification($event)"
        />
      </div>

      @if (notificationsService.notifications().length === 0) {
      <div class="notifications-empty-state">
        <ion-icon
          name="notifications-off"
          color="lightGrayColor"
          class="notifications-empty-state__icon"
        ></ion-icon>
        <ion-text
          class="lightGrayColor16SemiBold notifications-empty-state__text"
        >
          No any notifications
        </ion-text>
      </div>
      }
    </ion-content>
  `,
  styleUrls: ['./notifications.page.scss'],
  imports: [
    IonContent,
    IonIcon,
    IonText,
    TopBarComponent,
    FollowRequestCardComponent,
    NotificationListComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsPage {
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);
  readonly notificationsService = inject(NotificationsService);

  constructor() {
    addIcons({ notificationsOff });
  }

  removeNotification(id: string): void {
    this.notificationsService.removeNotification(id);
    this.notificationService.showInfo('Notification dismissed');
  }

  goTo(screen: string): void {
    this.router.navigateByUrl(screen);
  }
}
