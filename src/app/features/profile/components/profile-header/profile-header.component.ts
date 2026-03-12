import {
    ChangeDetectionStrategy,
    Component,
    input,
    output,
} from '@angular/core';
import { IonImg } from '@ionic/angular/standalone';

@Component({
  selector: 'app-profile-header',
  templateUrl: './profile-header.component.html',
  styleUrls: ['./profile-header.component.scss'],
  standalone: true,
  imports: [IonImg],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileHeaderComponent {
  name = input.required<string>();
  category = input.required<string>();
  description = input.required<string>();
  socialHandle = input.required<string>();
  website = input.required<string>();
  profileImage = input.required<string>();
  postsCount = input.required<string | number>();
  videosCount = input.required<string | number>();
  followersCount = input.required<string | number>();
  followingCount = input.required<string | number>();
  storyAvailable = input<boolean>(false);

  followersClick = output<void>();
  followingClick = output<void>();
  storyClick = output<void>();
}
