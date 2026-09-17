import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  input,
  output,
  signal,
  viewChild,
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
  followersCount = input.required<string | number>();
  followingCount = input.required<string | number>();

  followsYou = input<boolean>(false);
  bioExpanded = signal(false);
  private readonly bioRef = viewChild<ElementRef<HTMLElement>>('bio');

  followersClick = output<void>();
  followingClick = output<void>();

  hasValidImage = computed(() => isValidUserImage(this.profileImage()));

  userInitials = computed(() => getUserInitials(this.name()));

  constructor() {
    // Same contract as the feed text: a different bio must start collapsed, so
    // expansion never carries over to the profile that replaces this one.
    effect(() => {
      this.description();
      this.bioExpanded.set(false);
    });
  }

  expandBio(): void {
    this.bioExpanded.set(true);
    // The toggle unmounts on expand; move focus to the bio so keyboard and
    // screen-reader users keep their position instead of falling back to body.
    this.bioRef()?.nativeElement.focus();
  }
}
