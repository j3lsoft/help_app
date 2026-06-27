/** Canonical social user shape aligned with API field names. */
export interface FollowUserDto {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  isFollow: boolean;
  followsYou: boolean;
  bio: string | null;
}

export interface FollowRequestItem extends FollowUserDto {
  acceptRequest: boolean;
}
