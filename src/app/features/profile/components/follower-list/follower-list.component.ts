import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { IonText } from '@ionic/angular/standalone';
import { FollowUserDto } from '../../models/follow.dto';
import { FollowButtonComponent } from '@shared/components/follow-button/follow-button.component';
import { SocialUserAvatarComponent } from '@shared/components/social-user-avatar/social-user-avatar.component';

@Component({
  selector: 'app-follower-list',
  templateUrl: './follower-list.component.html',
  styleUrls: ['./follower-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [IonText, SocialUserAvatarComponent, FollowButtonComponent],
})
export class FollowerListComponent {
  items = input.required<FollowUserDto[]>();
  toggleFollow = output<FollowUserDto>();
  userClick = output<string>();
}
