import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { IonImg } from '@ionic/angular/standalone';
import { DEFAULT_PROFILE_IMAGE_PATH } from '../../constants/profile.constants';

@Component({
  selector: 'app-profile-header',
  templateUrl: './profile-header.component.html',
  styleUrls: ['./profile-header.component.scss'],
  imports: [IonImg],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileHeaderComponent {
  name = input.required<string>();
  category = input<string>('');
  description = input<string>('');
  socialHandle = input<string>('');
  website = input<string>('');
  profileImage = input.required<string>();
  postsCount = input.required<string | number>();
  videosCount = input.required<string | number>();
  followersCount = input.required<string | number>();
  followingCount = input.required<string | number>();
  storyAvailable = input<boolean>(false);

  onFollowersClick = output<void>();
  onFollowingClick = output<void>();
  onStoryClick = output<void>();

  hasValidImage = computed(() => {
    const image = this.profileImage();
    return (
      image &&
      image !== DEFAULT_PROFILE_IMAGE_PATH &&
      !image.includes('default-user')
    );
  });

  userInitials = computed(() => {
    const name = this.name();
    if (!name) return '?';
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  });
}
