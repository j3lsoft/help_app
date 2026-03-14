import { PostItem } from '../components/profile-post-grid/profile-post-grid.component';

/**
 * Mock data for the profile feature.
 * This data is used for development and testing before API integration.
 */

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
  { id: '10', image: 'assets/images/gallery/gallery10.png' },
  { id: '11', image: 'assets/images/gallery/gallery11.png' },
  { id: '12', image: 'assets/images/gallery/gallery12.png' },
  { id: '13', image: 'assets/images/gallery/gallery13.png' },
  { id: '14', image: 'assets/images/gallery/gallery14.png' },
  { id: '15', image: 'assets/images/gallery/gallery15.png' },
];

export const MOCK_VIDEO_POSTS: PostItem[] = [
  { id: 'v1', image: 'assets/images/videoThumbnails/thumbnail1.png', views: '190k' },
  { id: 'v2', image: 'assets/images/videoThumbnails/thumbnail2.png', views: '200k' },
  { id: 'v3', image: 'assets/images/videoThumbnails/thumbnail3.png', views: '120k' },
  { id: 'v4', image: 'assets/images/videoThumbnails/thumbnail4.png', views: '190k' },
  { id: 'v5', image: 'assets/images/videoThumbnails/thumbnail5.png', views: '200k' },
  { id: 'v6', image: 'assets/images/videoThumbnails/thumbnail6.png', views: '120k' },
  { id: 'v7', image: 'assets/images/videoThumbnails/thumbnail7.png', views: '190k' },
  { id: 'v8', image: 'assets/images/videoThumbnails/thumbnail8.png', views: '200k' },
  { id: 'v9', image: 'assets/images/videoThumbnails/thumbnail9.png', views: '120k' },
  { id: 'v10', image: 'assets/images/videoThumbnails/thumbnail10.png', views: '190k' },
  { id: 'v11', image: 'assets/images/videoThumbnails/thumbnail11.png', views: '190k' },
  { id: 'v12', image: 'assets/images/videoThumbnails/thumbnail12.png', views: '200k' },
];

export const MOCK_TAGGED_POSTS: PostItem[] = [
  { id: 't1', image: 'assets/images/posts/post26.png' },
  { id: 't2', image: 'assets/images/posts/post27.png' },
  { id: 't3', image: 'assets/images/posts/post28.png' },
  { id: 't4', image: 'assets/images/posts/post29.png' },
  { id: 't5', image: 'assets/images/gallery/gallery2.png' },
];

export const MOCK_USER_PROFILE = {
  username: 'samanthaofficial',
  name: 'Samantha Smith',
  category: 'Artist',
  description: 'Art + Prints + Workshops',
  socialHandle: 'samantha___',
  website: 'www.officialtinashah.com',
  profileImage: 'assets/images/users/user43.png',
  postsCount: '105',
  videosCount: '59',
  followersCount: '850k',
  followingCount: '542',
};
