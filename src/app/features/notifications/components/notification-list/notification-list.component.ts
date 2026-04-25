import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { NotificationItem } from '../../models/notification.model';
import { NotificationItemComponent } from '../notification-item/notification-item.component';

@Component({
  selector: 'app-notification-list',
  template: `
    <div class="notification-list">
      @if (notifications().length > 0) { @for (item of notifications(); track
      item.id) {
      <div class="notification-list__item">
        <app-notification-item
          [notification]="item"
          (delete)="delete.emit(item.id)"
        />
      </div>
      } }
    </div>
  `,
  styleUrls: ['./notification-list.component.scss'],
  imports: [NotificationItemComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationListComponent {
  notifications = input.required<NotificationItem[]>();
  delete = output<string>();
}
