import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { IonImg, IonText } from '@ionic/angular/standalone';
import { ChatUser } from '../../models/message.model';

@Component({
  selector: 'app-active-users',
  imports: [IonImg, IonText],
  templateUrl: './active-users.component.html',
  styleUrls: ['./active-users.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActiveUsersComponent {
  users = input.required<ChatUser[]>();
  userClick = output<string>();
}
