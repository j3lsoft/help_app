import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  IonContent,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonText,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { search } from 'ionicons/icons';
import { TopBarComponent } from '../../../../shared/components/top-bar/top-bar.component';
import { ActiveUsersComponent } from '../../components/active-users/active-users.component';
import { CallListComponent } from '../../components/call-list/call-list.component';
import { ChatListComponent } from '../../components/chat-list/chat-list.component';
import { MOCK_CALLS, MOCK_USERS } from '../../data/message.mock';
import { CallLog, ChatUser } from '../../models/message.model';

@Component({
  selector: 'app-message',
  imports: [
    IonContent,
    IonIcon,
    IonSegment,
    IonSegmentButton,
    IonText,
    TopBarComponent,
    ActiveUsersComponent,
    ChatListComponent,
    CallListComponent,
  ],
  templateUrl: './message.page.html',
  styleUrls: ['./message.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessagePage {
  private router = inject(Router);

  constructor() {
    addIcons({ search });
  }

  selectedTab = signal<'Chats' | 'Call'>('Chats');
  users = signal<ChatUser[]>(MOCK_USERS);
  calls = signal<CallLog[]>(MOCK_CALLS);

  activeUsers = computed(() => this.users().filter((user) => user.isActive));

  onFilterUpdate(event: CustomEvent) {
    this.selectedTab.set(event.detail.value as 'Chats' | 'Call');
  }

  goTo(screen: string) {
    this.router.navigateByUrl(screen);
  }

  onSearchClick() {
    this.goTo('search-chat');
  }

  onChatClick(userId: string) {
    this.goTo('chat');
  }

  onVideoCallClick(userId: string) {
    this.goTo('video-call');
  }

  onAudioCallClick(userId: string) {
    this.goTo('call');
  }
}
