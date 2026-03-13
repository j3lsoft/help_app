import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import {
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonText,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronBack, chevronForwardOutline, keyOutline } from 'ionicons/icons';

@Component({
  selector: 'app-security',
  templateUrl: './security.page.html',
  styleUrls: ['./security.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonHeader,
    IonToolbar,
    IonContent,
    IonIcon,
    IonText,
    IonList,
    IonItem,
    IonLabel,
  ],
})
export class SecurityPage {
  private readonly navCtrl = inject(NavController);
  private readonly router = inject(Router);

  constructor() {
    addIcons({
      chevronBack,
      chevronForwardOutline,
      keyOutline,
    });
  }

  goBack(): void {
    this.navCtrl.back();
  }

  goTo(url: string): void {
    this.router.navigateByUrl(url);
  }
}
