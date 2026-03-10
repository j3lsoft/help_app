import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonIcon,
  IonImg,
  IonInput,
  IonText,
  IonToolbar,
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { eyeOffOutline, eyeOutline } from 'ionicons/icons';
import { AuthHeaderComponent } from '../../components/auth-header/auth-header.component';
import { AuthPrimaryButtonComponent } from '../../components/auth-primary-button/auth-primary-button.component';
import { AuthSocialButtonsComponent } from '../../components/auth-social-buttons/auth-social-buttons.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [
    IonText,
    IonContent,
    IonInput,
    IonIcon,
    FormsModule,
    AuthHeaderComponent,
    AuthPrimaryButtonComponent,
    AuthSocialButtonsComponent,
  ],
})
export class LoginPage implements OnInit {
  private readonly router = inject(Router);

  email = '';
  password = '';
  showPassword = false;

  constructor() {
    addIcons({
      eyeOutline,
      eyeOffOutline,
    });
  }

  ngOnInit(): void {}

  goTo(screen: any): void {
    this.router.navigateByUrl(screen);
  }
}
