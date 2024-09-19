import { Component, OnInit } from '@angular/core';
import { NavController, Platform } from '@ionic/angular';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.page.html',
  styleUrls: ['./comments.page.scss'],
})
export class CommentsPage implements OnInit {

  commentsList: any = [
    {
      id: '1',
      userProfilePic: '../../../assets/images/users/user28.png',
      userProfileName: 'jiyashah_',
      userComment: '😇',
      commentTime: '1h',
      commentLike: 2,
      isLike: true,
      replyAvailable: true,
      replys: [
        {
          id: '1',
          userProfilePic: '../../../assets/images/users/user41.png',
          userProfileName: 'samanthaofficial',
          userReply: '😇',
          replyTo: '@jiyashah_',
          commentTime: '1h',
          commentLike: 2,
          isLike: false,
        },
      ],
    },
    {
      id: '2',
      userProfilePic: '../../../assets/images/users/user29.png',
      userProfileName: 'ishaofficial.',
      userComment: '💫🙂',
      mentionName: '@samanthaofficial',
      commentTime: '1h',
      commentLike: 2,
      replyAvailable: false,
      isLike: false,
    },
    {
      id: '3',
      userProfilePic: '../../../assets/images/users/user18.png',
      userProfileName: 'ishankhatri',
      userComment: 'Nice one...',
      mentionName: '@samanthaofficial',
      commentTime: '1h',
      commentLike: 2,
      replyAvailable: true,
      isLike: true,
      replys: [
        {
          id: '1',
          userProfilePic: '../../../assets/images/users/user41.png',
          userProfileName: 'samanthaofficial',
          userReply: 'Thank you',
          replyTo: '@ishankhatri',
          commentTime: '1h',
          commentLike: 2,
          isLike: false,
        }
      ],
    },
    {
      id: '4',
      userProfilePic: '../../../assets/images/users/user31.png',
      userProfileName: 'vaishanavi__',
      userComment: '🥀🌸',
      mentionName: '@samanthaofficial',
      commentTime: '1h',
      commentLike: 2,
      replyAvailable: false,
      isLike: true,
    },
    {
      id: '5',
      userProfilePic: '../../../assets/images/users/user27.png',
      userProfileName: 'anujshah.__',
      userComment: '👌',
      commentTime: '1h',
      commentLike: 2,
      replyAvailable: false,
      isLike: true,
    },
    {
      id: '6',
      userProfilePic: '../../../assets/images/users/user30.png',
      userProfileName: 'diya.___',
      userComment: '✨❤️',
      mentionName: '@samanthaofficial',
      commentTime: '1h',
      commentLike: 2,
      replyAvailable: false,
      isLike: false,
    },
    {
      id: '7',
      userProfilePic: '../../../assets/images/users/user32.png',
      userProfileName: 'monaliali.',
      userComment: 'Adorable 🔥',
      mentionName: '@samanthaofficial',
      commentTime: '1h',
      commentLike: 2,
      replyAvailable: true,
      isLike: true,
      replys: [
        {
          id: '1',
          userProfilePic: '../../../assets/images/users/user41.png',
          userProfileName: 'samanthaofficial',
          userReply: 'Thank you',
          replyTo: '@monaliali.',
          commentTime: '1h',
          commentLike: 2,
          isLike: false,
        }
      ],
    },
    {
      id: '8',
      userProfilePic: '../../../assets/images/users/user28.png',
      userProfileName: 'jiyashah_',
      userComment: '😇',
      mentionName: '@samanthaofficial',
      commentTime: '1h',
      commentLike: 2,
      replyAvailable: true,
      isLike: false,
      replys: [
        {
          id: '1',
          userProfilePic: '../../../assets/images/users/user41.png',
          userProfileName: 'samanthaofficial',
          userReply: '😇',
          replyTo: '@jiyashah_',
          commentTime: '1h',
          commentLike: 1,
          isLike: false,
        }
      ],
    },
    {
      id: '9',
      userProfilePic: '../../../assets/images/users/user29.png',
      userProfileName: 'ishaofficial.',
      userComment: '💫🙂',
      mentionName: '@samanthaofficial',
      commentTime: '1h',
      commentLike: 2,
      replyAvailable: false,
      isLike: true,
    },
    {
      id: '10',
      userProfilePic: '../../../assets/images/users/user18.png',
      userProfileName: 'ishankhatri',
      userComment: 'Nice one...',
      mentionName: '@samanthaofficial',
      commentTime: '1h',
      commentLike: 2,
      replyAvailable: true,
      isLike: false,
      replys: [
        {
          id: '1',
          userProfilePic: '../../../assets/images/users/user41.png',
          userProfileName: 'samanthaofficial',
          userReply: 'Thank you',
          replyTo: '@ishankhatri',
          commentTime: '1h',
          commentLike: 2,
          isLike: false,
        }
      ],
    },
    {
      id: '11',
      userProfilePic: '../../../assets/images/users/user31.png',
      userProfileName: 'vaishanavi__',
      userComment: '🥀🌸',
      mentionName: '@samanthaofficial',
      commentTime: '1h',
      commentLike: 2,
      replyAvailable: false,
      isLike: true,
    },
    {
      id: '12',
      userProfilePic: '../../../assets/images/users/user27.png',
      userProfileName: 'anujshah.__',
      userComment: '👌',
      commentTime: '1h',
      commentLike: 2,
      replyAvailable: false,
      isLike: false,
    },
    {
      id: '13',
      userProfilePic: '../../../assets/images/users/user30.png',
      userProfileName: 'diya.___',
      userComment: '✨❤️',
      mentionName: '@samanthaofficial',
      commentTime: '1h',
      commentLike: 2,
      replyAvailable: false,
      isLike: false,
    },
    {
      id: '14',
      userProfilePic: '../../../assets/images/users/user32.png',
      userProfileName: 'monaliali.',
      userComment: 'Adorable 🔥',
      mentionName: '@samanthaofficial',
      commentTime: '1h',
      commentLike: 2,
      replyAvailable: true,
      isLike: false,
      replys: [
        {
          id: '1',
          userProfilePic: '../../../assets/images/users/user41.png',
          userProfileName: 'samanthaofficial',
          userReply: 'Thank you',
          replyTo: '@monaliali.',
          commentTime: '1h',
          commentLike: 2,
          isLike: true,
        }
      ],
    },
  ];

  comment: any = '';

  constructor(private navCtrl: NavController,public platform:Platform) { }

  ngOnInit() {
  }

  goBack() {
    this.navCtrl.back()
  }

  submitComment() {
    this.comment = '';
  }

}
