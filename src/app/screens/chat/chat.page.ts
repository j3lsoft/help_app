import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, NavController, Platform } from '@ionic/angular';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {

  @ViewChild('textArea') textArea: any;
  @ViewChild(IonContent) content: IonContent | undefined;

  userMessages = [
    {
      id: '1',
      message: 'Hello Samantha!',
      isSender: false,
      messageTime: '10:48 am',
    },
    {
      id: '2',
      message: 'Good morning',
      isSender: false,
      messageTime: '10:48 am',
    },
    {
      id: '3',
      message: `Hey jiya\nGood morning`,
      isSender: true,
      messageTime: '10:49 am',
    },
    {
      id: '4',
      message: 'Lorem Ipsum is simply dummy text.',
      isSender: false,
      messageTime: '10:50 am',
    },
    {
      id: '5',
      message: 'Lorem Ipsum is simply dummy text of the\nprinting and typesetting industry.',
      isSender: true,
      messageTime: '10:52 am',
    },
    {
      id: '6',
      messageType: 'images',
      images: [
        '../../../assets/images/messageImages/messageImage1.png',
        '../../../assets/images/messageImages/messageImage2.png',
        '../../../assets/images/messageImages/messageImage3.png',
        '../../../assets/images/messageImages/messageImage4.png',
      ],
      isSender: true,
      messageTime: '10:52 am',
    },
    {
      id: '7',
      message: '👍',
      isSender: false,
      messageTime: '10:54 am',
    },
    {
      id: '8',
      message: '👍',
      isSender: true,
      messageTime: '10:55 am',
    },
  ];

  receiverImage = '../../../assets/images/users/user12.png';

  senderImage = '../../../assets/images/users/user43.png';

  newMsg = '';

  constructor(private navCtrl: NavController, public platform: Platform, private router: Router) { }

  ngOnInit() {
  }

  goBack() {
    this.navCtrl.back()
  }

  addMessage() {
    if (this.newMsg) {
      let date = Date();
      let hour = (new Date(date)).getHours();
      let minute = (new Date(date)).getMinutes();
      let AmPm = hour >= 12 ? 'pm' : 'am';
      let finalhour = hour > 12 ? (hour - 12) : hour;

      const addedMessage = {
        id: (this.userMessages.length + 1).toString(),
        message: this.newMsg,
        messageTime: `${finalhour}:${minute} ${AmPm}`,
        isSender: true,
      }

      this.userMessages.push(addedMessage);
      this.newMsg = '';
      setTimeout(() => {
        this.content?.scrollToBottom(200)
      });
      this.textArea.setFocus();
    }
  }

  focus() {
    setTimeout(() => {
      this.content?.scrollToBottom(200)
    });
  }

  goTo(screen: any) {
    this.router.navigateByUrl(screen);
  }

}
