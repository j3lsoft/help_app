import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { IonHeader, IonIcon, IonText, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { search } from 'ionicons/icons';

@Component({
  selector: 'app-message-header',
  imports: [IonHeader, IonToolbar, IonText, IonIcon],
  templateUrl: './message-header.component.html',
  styleUrls: ['./message-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessageHeaderComponent {
  title = input.required<string>();
  searchClick = output<void>();

  constructor() {
    addIcons({ search });
  }
}
