import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { IonText } from '@ionic/angular/standalone';

@Component({
  selector: 'app-auth-primary-button',
  templateUrl: './auth-primary-button.component.html',
  styleUrls: ['./auth-primary-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonText],
  host: {
    class: 'center margin20 auth-primary-button',
    '[class.auth-primary-button--disabled]': 'disabled()',
    '(click)': 'onClick()',
  },
})
export class AuthPrimaryButtonComponent {
  label = input.required<string>();
  disabled = input(false);
  clicked = output<void>();

  onClick(): void {
    if (this.disabled()) {
      return;
    }
    this.clicked.emit();
  }
}

