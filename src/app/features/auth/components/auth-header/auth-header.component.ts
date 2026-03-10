import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import {
  IonHeader,
  IonIcon,
  IonText,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronBack } from 'ionicons/icons';

@Component({
  selector: 'app-auth-header',
  templateUrl: './auth-header.component.html',
  styleUrls: ['./auth-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonHeader, IonToolbar, IonIcon, IonText],
})
export class AuthHeaderComponent {
  title = input.required<string>();
  showBack = input(false);
  back = output<void>();

  constructor() {
    addIcons({
      chevronBack,
    });
  }

  onBack(): void {
    this.back.emit();
  }
}

