import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import {
  IonHeader,
  IonIcon,
  IonImg,
  IonText,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { search } from 'ionicons/icons';

@Component({
  selector: 'app-home-header',
  templateUrl: './home-header.component.html',
  styleUrls: ['./home-header.component.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonImg, IonText, IonIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeHeaderComponent {
  searchClick = output<void>();

  constructor() {
    addIcons({ search });
  }
}
