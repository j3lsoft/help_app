import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { IonText } from '@ionic/angular/standalone';
import { FollowUserDto } from '@features/profile/models/follow.dto';
import { FollowButtonComponent } from '@shared/components/follow-button/follow-button.component';
import { SocialUserAvatarComponent } from '@shared/components/social-user-avatar/social-user-avatar.component';

@Component({
  selector: 'app-suggestion-list',
  standalone: true,
  imports: [IonText, SocialUserAvatarComponent, FollowButtonComponent],
  templateUrl: './suggestion-list.component.html',
  styleUrls: ['./suggestion-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuggestionListComponent {
  suggestions = input.required<FollowUserDto[]>();
  toggleFollow = output<FollowUserDto>();
  seeAllClick = output<void>();
  userClick = output<string>();
}
