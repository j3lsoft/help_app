import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
} from '@angular/core';
import { IonText } from '@ionic/angular/standalone';
import { FollowUserDto } from '@features/profile/models/follow.dto';
import { RelationshipService } from '@features/profile/services/relationship.service';
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
  protected readonly relationships = inject(RelationshipService);

  suggestions = input.required<FollowUserDto[]>();
  toggleFollow = output<FollowUserDto>();
  seeAllClick = output<void>();
  userClick = output<string>();

  protected isFollowing(userId: string): boolean {
    return this.relationships.relationship(userId)().isFollowing;
  }

  protected isToggling(userId: string): boolean {
    return this.relationships.relationship(userId)().isToggling;
  }
}
