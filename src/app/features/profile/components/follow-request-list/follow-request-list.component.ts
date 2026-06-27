import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { IonText } from '@ionic/angular/standalone';
import { FollowRequestItem } from '../../models/follow.dto';

@Component({
  selector: 'app-follow-request-list',
  templateUrl: './follow-request-list.component.html',
  styleUrls: ['./follow-request-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [IonText],
})
export class FollowRequestListComponent {
  requests = input.required<FollowRequestItem[]>();
  toggleFollow = output<string>();
  accept = output<string>();
  delete = output<string>();
}
