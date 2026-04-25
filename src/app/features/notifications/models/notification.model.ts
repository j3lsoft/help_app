export type NotificationType =
  | 'following'
  | 'likeMorePhotos'
  | 'likeOnePhoto'
  | 'mention'
  | 'likeByMore'
  | 'seeOldPost';

export interface LikedPhoto {
  photo: string;
}

export interface UserProfilePic {
  userProfilePic: string;
}

export interface NotificationItem {
  id: string;
  type: NotificationType;
  notificationTime: string;
  userProfilePic?: string;
  userName?: string;
  likedPohotos?: LikedPhoto[];
  likedPhoto?: string;
  mantionUserName?: string;
  comment?: string;
  mentionPhoto?: string;
  userProfilePics?: UserProfilePic[];
  userProfileNames?: string[];
  postTime?: string;
  seeTime?: string;
  post?: string;
}
