import { Injectable, signal } from '@angular/core';
import { NotificationItem } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private notificationsList = signal<NotificationItem[]>([
    {
      id: '1',
      type: 'following',
      userProfilePic: '../../../assets/images/users/user12.png',
      userName: 'Jimmy Nislon',
      notificationTime: '3 minutes ago',
    },
    {
      id: '2',
      type: 'likeMorePhotos',
      userProfilePic: '../../../assets/images/users/user2.png',
      userName: 'Alicia Sierra',
      likedPohotos: [
        {
          photo: '../../../assets/images/posts/post6.png',
        },
        {
          photo: '../../../assets/images/posts/post7.png',
        },
        {
          photo: '../../../assets/images/posts/post8.png',
        }
      ],
      notificationTime: '5 minutes ago',
    },
    {
      id: '3',
      type: 'likeOnePhoto',
      userProfilePic: '../../../assets/images/users/user30.png',
      userName: 'Isha Khatri',
      likedPhoto: '../../../assets/images/gallery/gallery1.png',
      notificationTime: '15 minutes ago',
    },
    {
      id: '4',
      type: 'following',
      userProfilePic: '../../../assets/images/users/user30.png',
      userName: 'Isha Khatri',
      notificationTime: '20 minutes ago',
    },
    {
      id: '5',
      type: 'mention',
      userProfilePic: '../../../assets/images/users/user3.png',
      mentionPhoto: '../../../assets/images/gallery/gallery1.png',
      userName: 'dennyjohn.',
      mantionUserName: '@samanthaofficial',
      comment: 'very nice...',
      notificationTime: '35 minutes ago',
    },
    {
      id: '6',
      type: 'following',
      userProfilePic: '../../../assets/images/users/user29.png',
      userName: 'Tisha Jain',
      notificationTime: '40 minutes ago',
    },
    {
      id: '7',
      type: 'likeMorePhotos',
      userProfilePic: '../../../assets/images/users/user4.png',
      userName: 'Smiti Khan',
      likedPohotos: [
        {
          photo: '../../../assets/images/publicPosts/post23.png',
        },
        {
          photo: '../../../assets/images/publicPosts/post24.png',
        },
        {
          photo: '../../../assets/images/publicPosts/post20.png',
        },
        {
          photo: '../../../assets/images/publicPosts/post11.png',
        }
      ],
      notificationTime: '50 minutes ago',
    },
    {
      id: '8',
      type: 'likeOnePhoto',
      userProfilePic: '../../../assets/images/users/user41.png',
      userName: 'Sonali Mishra',
      likedPhoto: '../../../assets/images/gallery/gallery5.png',
      notificationTime: '15 minutes ago',
    },
    {
      id: '9',
      type: 'mention',
      userProfilePic: '../../../assets/images/users/user3.png',
      mentionPhoto: '../../../assets/images/gallery/gallery1.png',
      userName: 'dennyjohn.',
      mantionUserName: '@samanthaofficial',
      comment: 'very nice...',
      notificationTime: '2 days ago',
    },
    {
      id: '10',
      type: 'likeByMore',
      userProfilePics: [
        {
          userProfilePic: '../../../assets/images/users/user41.png'
        },
        {
          userProfilePic: '../../../assets/images/users/user42.png'
        },
      ],
      userProfileNames: ['Sonali Mishra', 'Roy Ali', '', '', '', ''],
      likedPhoto: '../../../assets/images/posts/post10.png',
      notificationTime: '2 days ago',
    },
    {
      id: '11',
      type: 'seeOldPost',
      postTime: '1 year ago',
      seeTime: 'today',
      post: '../../../assets/images/gallery/gallery5.png',
      notificationTime: '3 days ago',
    },
    {
      id: '12',
      type: 'likeByMore',
      userProfilePics: [
        {
          userProfilePic: '../../../assets/images/users/user41.png'
        },
        {
          userProfilePic: '../../../assets/images/users/user42.png'
        },
      ],
      userProfileNames: ['Sonali Mishra', 'Roy Ali', '', '', '', ''],
      likedPhoto: '../../../assets/images/posts/post10.png',
      notificationTime: '2 days ago',
    },
    {
      id: '13',
      type: 'mention',
      userProfilePic: '../../../assets/images/users/user3.png',
      mentionPhoto: '../../../assets/images/gallery/gallery1.png',
      userName: 'dennyjohn.',
      mantionUserName: '@samanthaofficial',
      comment: 'very nice...',
      notificationTime: '3 days ago'
    },
    {
      id: '14',
      type: 'likeMorePhotos',
      userProfilePic: '../../../assets/images/users/user4.png',
      userName: 'Smiti Khan',
      likedPohotos: [
        {
          photo: '../../../assets/images/publicPosts/post23.png',
        },
        {
          photo: '../../../assets/images/publicPosts/post24.png',
        },
        {
          photo: '../../../assets/images/publicPosts/post20.png',
        },
        {
          photo: '../../../assets/images/publicPosts/post11.png',
        }
      ],
      notificationTime: '50 minutes ago',
    },
  ]);

  readonly notifications = this.notificationsList.asReadonly();

  removeNotification(id: string): void {
    this.notificationsList.update(list => list.filter(item => item.id !== id));
  }
}
