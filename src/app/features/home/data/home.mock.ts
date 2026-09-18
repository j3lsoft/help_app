import { Post } from '@features/posts/models/post-view.model';
import { UserStory } from '../components/story-list/story-list.component';

/**
 * Mock data for the home feed feature.
 * This data is used for development and testing before API integration.
 */

export const MOCK_USERS_STORIES: UserStory[] = [
  {
    id: '1',
    userProfilePic: '../../../../assets/images/users/user1.png',
    storySeen: false,
    userName: 'ShreeTest',
  },
  {
    id: '2',
    userProfilePic: '../../../../assets/images/users/user2.png',
    storySeen: false,
    userName: 'Alicia',
  },
  {
    id: '3',
    userProfilePic: '../../../../assets/images/users/user3.png',
    storySeen: false,
    userName: 'Denny',
  },
  {
    id: '4',
    userProfilePic: '../../../../assets/images/users/user4.png',
    storySeen: true,
    userName: 'Smiti',
  },
  {
    id: '5',
    userProfilePic: '../../../../assets/images/users/user5.png',
    storySeen: false,
    userName: 'Imran',
  },
  {
    id: '6',
    userProfilePic: '../../../../assets/images/users/user6.png',
    storySeen: true,
    userName: 'Dolly',
  },
  {
    id: '7',
    userProfilePic: '../../../../assets/images/users/user7.png',
    storySeen: true,
    userName: 'Denver',
  },
  {
    id: '8',
    userProfilePic: '../../../../assets/images/users/user8.png',
    storySeen: true,
    userName: 'Isha',
  },
  {
    id: '9',
    userProfilePic: '../../../../assets/images/users/user9.png',
    storySeen: true,
    userName: 'Trisha',
  },
  {
    id: '10',
    userProfilePic: '../../../../assets/images/users/user10.png',
    storySeen: true,
    userName: 'Roy',
  },
];

const DUMMY_POST_TEXT =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ipsum amet pellentesque in rhoncus, in erat. Placerat et nunc ipsum donec urna feugiat suspendisse.';

export const MOCK_TODAY_POSTS: Post[] = [
  {
    id: '1',
    userProfilePic: '../../../../assets/images/users/user2.png',
    userName: 'Alicia Sierra',
    username: 'alicia_sierra',
    createdAt: '2026-09-13T09:30:00Z',
    aboutPost: DUMMY_POST_TEXT,
    postLikes: '10k',
    postComments: '100',
    postShares: '35',
    postSaves: '120',
    postSaved: true,
    postImage: '../../../../assets/images/posts/post1.png',
    postImages: [
      '../../../../assets/images/posts/post1.png',
      '../../../../assets/images/posts/post2.png',
    ],
    postLike: true,
  },
  {
    id: '2',
    userProfilePic: '../../../../assets/images/users/user4.png',
    userName: 'Smiti Khana',
    username: 'smiti_khana',
    createdAt: '2026-09-12T18:05:00Z',
    aboutPost: DUMMY_POST_TEXT,
    postLikes: '10k',
    postComments: '100',
    postShares: '35',
    postSaves: '8',
    postSaved: false,
    postImage: '../../../../assets/images/posts/post2.png',
    postImages: ['../../../../assets/images/posts/post2.png'],
    postLike: false,
  },
];

export const MOCK_OLD_POSTS: Post[] = [
  {
    id: 'o1',
    userProfilePic: '../../../../assets/images/users/user3.png',
    userName: 'Denny John',
    username: 'denny_john',
    createdAt: '2026-09-08T13:20:00Z',
    aboutPost: DUMMY_POST_TEXT,
    postLikes: '10k',
    postComments: '100',
    postShares: '35',
    postSaves: '64',
    postSaved: true,
    postImage: '../../../../assets/images/posts/post3.png',
    postImages: ['../../../../assets/images/posts/post3.png'],
    postLike: true,
  },
  {
    id: 'o2',
    userProfilePic: '../../../../assets/images/users/user8.png',
    userName: 'Roy Khurana',
    username: 'roy_khurana',
    createdAt: '2026-09-01T08:00:00Z',
    aboutPost: DUMMY_POST_TEXT,
    postLikes: '10k',
    postComments: '100',
    postShares: '35',
    postSaves: '12',
    postSaved: false,
    postImage: '../../../../assets/images/posts/post4.png',
    postImages: ['../../../../assets/images/posts/post4.png'],
    postLike: false,
  },
  {
    id: 'o3',
    userProfilePic: '../../../../assets/images/users/user10.png',
    userName: 'Ishan Khatri',
    username: 'ishan_khatri',
    createdAt: '2026-08-20T16:45:00Z',
    aboutPost: DUMMY_POST_TEXT,
    postLikes: '10k',
    postComments: '100',
    postShares: '35',
    postSaves: '5',
    postSaved: false,
    postImage: '../../../../assets/images/posts/post5.png',
    postImages: ['../../../../assets/images/posts/post5.png'],
    postLike: false,
  },
];
