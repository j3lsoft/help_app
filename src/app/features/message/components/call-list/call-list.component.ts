import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { IonImg, IonText } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { call, videocam } from 'ionicons/icons';
import { CallLog } from '../../models/message.model';

@Component({
  selector: 'app-call-list',
  imports: [IonImg, IonText],
  templateUrl: './call-list.component.html',
  styleUrls: ['./call-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CallListComponent {
  calls = input.required<CallLog[]>();
  videoClick = output<string>();
  audioClick = output<string>();

  constructor() {
    addIcons({ videocam, call });
  }
}
