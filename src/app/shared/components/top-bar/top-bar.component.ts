import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  contentChild,
  input,
  TemplateRef,
} from '@angular/core';
import { IonHeader, IonText, IonToolbar } from '@ionic/angular/standalone';

/**
 * Reusable Top Bar component for main screens.
 * Uses content projection for right-side actions.
 */
/**
 * Reusable Top Bar component for main screens.
 * Supports either a simple title (string) or custom left content via template ref.
 * Use content projection for right-side actions.
 *
 * Usage with title:
 *   <app-top-bar title="Page Title">
 *     <ion-icon name="settings" />
 *   </app-top-bar>
 *
 * Usage with custom left content:
 *   <app-top-bar>
 *     <ng-template #leftContent>
 *       <img src="logo.png" />
 *     </ng-template>
 *     <ion-icon name="search" />
 *   </app-top-bar>
 */
@Component({
  selector: 'app-top-bar',
  template: `
    <ion-header mode="ios" [translucent]="false">
      <ion-toolbar color="whiteColor" class="top-bar__toolbar">
        <div class="rowAlignCenter top-bar__content">
          @if (leftContent()) {
          <ng-container [ngTemplateOutlet]="leftContent()!" />
          } @else {
          <ion-text class="blackColor20SemiBold">{{ title() }}</ion-text>
          }
          <ng-content></ng-content>
        </div>
      </ion-toolbar>
    </ion-header>
  `,
  imports: [CommonModule, IonHeader, IonToolbar, IonText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./top-bar.component.scss'],
})
export class TopBarComponent {
  title = input<string>();
  leftContent = contentChild<TemplateRef<unknown>>('leftContent');
}
