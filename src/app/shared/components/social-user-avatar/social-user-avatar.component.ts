import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import {
  getUserInitials,
  isValidUserImage,
} from '@shared/utils/user-display.utils';

@Component({
  selector: 'app-social-user-avatar',
  templateUrl: './social-user-avatar.component.html',
  styleUrls: ['./social-user-avatar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'social-user-avatar',
    '[class.social-user-avatar--lg]': 'size() === "lg"',
  },
})
export class SocialUserAvatarComponent {
  avatarUrl = input<string | null | undefined>(null);
  displayName = input<string | undefined | null>('');
  size = input<'sm' | 'lg'>('sm');

  protected readonly showImage = computed(() =>
    isValidUserImage(this.avatarUrl())
  );

  protected readonly initials = computed(() =>
    getUserInitials(this.displayName())
  );
}
