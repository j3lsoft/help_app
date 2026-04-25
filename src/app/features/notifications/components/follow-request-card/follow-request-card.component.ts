import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { Router } from '@angular/router';
import { IonText } from '@ionic/angular/standalone';

@Component({
  selector: 'app-follow-request-card',
  template: `
    <div (click)="goTo('follow-requests')" class="follow-request-card">
      <div class="follow-request-card__avatar-wrapper">
        <img
          src="../../../assets/images/users/user27.png"
          class="follow-request-card__avatar"
          alt="User avatar"
        />
        <div class="follow-request-card__count-badge">
          <ion-text
            class="whiteColor14Bold ellipseText follow-request-card__count-text"
          >
            {{ count() }}
          </ion-text>
        </div>
      </div>
      <div class="follow-request-card__content">
        <ion-text class="blackColor18SemiBold"> Follow Request </ion-text>
        <ion-text class="grayColor14Regular">
          Approve or ignore requests
        </ion-text>
      </div>
    </div>
  `,
  styleUrls: ['./follow-request-card.component.scss'],
  imports: [IonText],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FollowRequestCardComponent {
  private readonly router = inject(Router);

  count = input.required<number>();

  goTo(screen: string): void {
    this.router.navigateByUrl(screen);
  }
}
