import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import {
  getUserInitials,
  isValidUserImage,
} from '@shared/utils/user-display.utils';

@Component({
  selector: 'app-profile-header',
  templateUrl: './profile-header.component.html',
  styleUrls: ['./profile-header.component.scss'],
  imports: [NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileHeaderComponent {
  name = input.required<string>();
  description = input<string>('');
  website = input<string>('');
  fullWebsiteUrl = input<string>('');
  profileImage = input.required<string>();
  postsCount = input.required<string | number>();
  videosCount = input.required<string | number>();
  followersCount = input.required<string | number>();
  followingCount = input.required<string | number>();
  storyAvailable = input<boolean>(false);

  onFollowersClick = output<void>();
  onFollowingClick = output<void>();
  onStoryClick = output<void>();

  hasValidImage = computed(() => isValidUserImage(this.profileImage()));

  userInitials = computed(() => getUserInitials(this.name()));
}
