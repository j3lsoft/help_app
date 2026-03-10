import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonImg } from '@ionic/angular/standalone';

@Component({
  selector: 'app-auth-social-buttons',
  templateUrl: './auth-social-buttons.component.html',
  styleUrls: ['./auth-social-buttons.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonImg],
})
export class AuthSocialButtonsComponent {}

