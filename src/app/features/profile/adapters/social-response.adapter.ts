import {
  FollowerProfileResponseDto,
  SuggestedUserResponseDto,
} from '../models/social.dto';
import { FollowUserDto } from '../models/follow.dto';

export class SocialResponseAdapter {
  static followerToFollowUser(dto: FollowerProfileResponseDto): FollowUserDto {
    return {
      id: dto.id,
      username: dto.username,
      displayName: dto.displayName ?? dto.username,
      avatarUrl: dto.avatarUrl ?? '',
      isFollow: dto.relationship?.isFollowing ?? false,
      followsYou: dto.relationship?.followsYou ?? false,
      bio: null,
    };
  }

  static followerListToFollowUserList(
    items: FollowerProfileResponseDto[]
  ): FollowUserDto[] {
    return items.map(SocialResponseAdapter.followerToFollowUser);
  }

  static suggestionToFollowUser(dto: SuggestedUserResponseDto): FollowUserDto {
    return {
      id: dto.id,
      username: dto.username,
      displayName: dto.displayName,
      avatarUrl: dto.avatarUrl ?? '',
      isFollow: false,
      followsYou: false,
      bio: dto.bio,
    };
  }

  static suggestionListToFollowUserList(
    items: SuggestedUserResponseDto[]
  ): FollowUserDto[] {
    return items.map(SocialResponseAdapter.suggestionToFollowUser);
  }
}
