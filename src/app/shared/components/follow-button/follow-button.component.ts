import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { IonText } from '@ionic/angular/standalone';

@Component({
  selector: 'app-follow-button',
  imports: [IonText],
  templateUrl: './follow-button.component.html',
  styleUrls: ['./follow-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'follow-button',
    '[class.follow-button--following]': 'isFollowing()',
    '[class.follow-button--list]': 'variant() === "list"',
    '[class.follow-button--card]': 'variant() === "card"',
    '[class.follow-button--profile]': 'variant() === "profile"',
  },
})
export class FollowButtonComponent {
  isFollowing = input(false);
  variant = input<'list' | 'card' | 'profile'>('card');
  disabled = input(false);

  followClick = output<void>();

  protected onClick(event: Event): void {
    event.stopPropagation();
    if (!this.disabled()) {
      this.followClick.emit();
    }
  }
}
