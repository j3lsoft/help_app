import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { IonIcon, IonImg, IonText } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add } from 'ionicons/icons';

export interface UserStory {
  id: string;
  userProfilePic: string;
  storySeen: boolean;
  userName: string;
}

@Component({
  selector: 'app-story-list',
  standalone: true,
  imports: [IonText, IonIcon, IonImg],
  templateUrl: './story-list.component.html',
  styleUrls: ['./story-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoryListComponent {
  stories = input.required<UserStory[]>();
  shareStory = output<void>();
  storyClick = output<UserStory>();

  constructor() {
    addIcons({ add });
  }
}
