import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { IonImg, IonText } from '@ionic/angular/standalone';
import { ChatUser } from '../../models/message.model';

@Component({
  selector: 'app-chat-list',
  imports: [IonImg, IonText],
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatListComponent {
  chats = input.required<ChatUser[]>();
  chatClick = output<string>();
}
