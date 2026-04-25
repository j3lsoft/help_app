import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  contentChild,
  input,
  output,
  TemplateRef,
} from '@angular/core';
import {
  IonHeader,
  IonIcon,
  IonText,
  IonToolbar,
} from '@ionic/angular/standalone';

/**
 * Header component for deep navigation screens.
 * Displays a back button on the left, centered title, and optional right action.
 */
@Component({
  selector: 'app-back-header',
  template: `
    <ion-header mode="ios" [translucent]="false">
      <ion-toolbar color="whiteColor" class="back-header__toolbar">
        <div class="rowAlignCenter back-header__content">
          <ion-icon
            (click)="backClick.emit()"
            name="chevron-back"
            color="blackColor"
            class="back-header__back-icon"
            aria-label="Go back"
          ></ion-icon>

          <ion-text class="blackColor20SemiBold back-header__title">
            {{ title() }}
          </ion-text>

          <div class="back-header__right-action">
            @if (rightAction()) {
            <ng-container *ngTemplateOutlet="rightAction()!" />
            }
          </div>
        </div>
      </ion-toolbar>
    </ion-header>
  `,
  imports: [CommonModule, IonHeader, IonToolbar, IonIcon, IonText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./back-header.component.scss'],
})
export class BackHeaderComponent {
  title = input.required<string>();
  backClick = output<void>();
  rightAction = contentChild<TemplateRef<unknown>>('rightAction');
}
