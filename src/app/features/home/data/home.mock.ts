import { UserStory } from '../components/story-list/story-list.component';

/**
 * Mock data for features the backend does not expose yet (stories).
 * The Home Feed reads from the API; only stories remain local in v1.
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
