import { FollowRequestItem } from '../models/follow.dto';
import { PostItem } from '../models/post-item.model';

export const MOCK_ALL_POSTS: PostItem[] = [
  { id: '1', image: 'assets/images/gallery/gallery1.png' },
  { id: '2', image: 'assets/images/gallery/gallery2.png' },
  { id: '3', image: 'assets/images/gallery/gallery3.png' },
  { id: '4', image: 'assets/images/gallery/gallery4.png' },
  { id: '5', image: 'assets/images/gallery/gallery5.png' },
  { id: '6', image: 'assets/images/gallery/gallery6.png' },
  { id: '7', image: 'assets/images/gallery/gallery7.png' },
  { id: '8', image: 'assets/images/gallery/gallery8.png' },
  { id: '9', image: 'assets/images/gallery/gallery9.png' },
];

export const MOCK_VIDEO_POSTS: PostItem[] = [
  { id: 'v1', image: 'assets/images/gallery/gallery3.png' },
  { id: 'v2', image: 'assets/images/gallery/gallery4.png' },
  { id: 'v3', image: 'assets/images/gallery/gallery5.png' },
];

export const MOCK_TAGGED_POSTS: PostItem[] = [
  { id: 't1', image: 'assets/images/gallery/gallery6.png' },
  { id: 't2', image: 'assets/images/gallery/gallery7.png' },
  { id: 't3', image: 'assets/images/gallery/gallery8.png' },
  { id: 't4', image: 'assets/images/gallery/gallery9.png' },
  { id: 't5', image: 'assets/images/gallery/gallery2.png' },
];

export const MOCK_FOLLOW_REQUESTS: FollowRequestItem[] = [
  { id: '1', avatarUrl: '../../../assets/images/users/user27.png', username: 'royyy._____', displayName: 'Roy Jain', isFollow: false, followsYou: false, bio: null, acceptRequest: false },
  { id: '2', avatarUrl: '../../../assets/images/users/user28.png', username: 'jiyashah_', displayName: 'Jiya shah', isFollow: false, followsYou: false, bio: null, acceptRequest: false },
  { id: '3', avatarUrl: '../../../assets/images/users/user29.png', username: 'ishaofficial.', displayName: 'Isha Ali', isFollow: false, followsYou: false, bio: null, acceptRequest: false },
  { id: '4', avatarUrl: '../../../assets/images/users/user30.png', username: 'diya.____', displayName: 'Diya Mehta', isFollow: false, followsYou: false, bio: null, acceptRequest: false },
  { id: '5', avatarUrl: '../../../assets/images/users/user18.png', username: 'ishankhatri.', displayName: 'Ishan Khatri', isFollow: false, followsYou: false, bio: null, acceptRequest: false },
  { id: '6', avatarUrl: '../../../assets/images/users/user31.png', username: 'vaishanavi__', displayName: 'V', isFollow: false, followsYou: false, bio: null, acceptRequest: false },
  { id: '7', avatarUrl: '../../../assets/images/users/user14.png', username: 'dhirajshah__', displayName: 'Dhiraj Shah', isFollow: false, followsYou: false, bio: null, acceptRequest: false },
  { id: '8', avatarUrl: '../../../assets/images/users/user32.png', username: 'monaliali.', displayName: 'Monali', isFollow: false, followsYou: false, bio: null, acceptRequest: false },
  { id: '9', avatarUrl: '../../../assets/images/users/user33.png', username: 'anujshah.__', displayName: 'Anuj Shah', isFollow: false, followsYou: false, bio: null, acceptRequest: false },
  { id: '10', avatarUrl: '../../../assets/images/users/user34.png', username: 'realkrupali.', displayName: 'K', isFollow: false, followsYou: false, bio: null, acceptRequest: false },
];
