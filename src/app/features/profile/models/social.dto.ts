import { PaginatedResponse } from '@core/models/paginated-response.model';

export interface FollowRelationResponseDto {
  followerId: string;
  followeeId: string;
  createdAt: string;
}

export interface UserRelationshipDto {
  isFollowing: boolean;
  followsYou: boolean;
}

export interface FollowerProfileResponseDto {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl: string | null;
  relationship?: UserRelationshipDto;
}

export type PaginatedFollowersResponseDto =
  PaginatedResponse<FollowerProfileResponseDto>;

export interface FollowStatusResponseDto {
  isFollowing: boolean;
}

export interface FollowCountsResponseDto {
  followerCount: number;
  followeeCount: number;
}

export interface SuggestedUserResponseDto {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
}

export type PaginatedSuggestionsResponseDto =
  PaginatedResponse<SuggestedUserResponseDto>;
