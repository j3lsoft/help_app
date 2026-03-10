import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { IonImg, IonText } from '@ionic/angular/standalone';

export interface Suggestion {
  id: string;
  userProfilePic: string;
  userName: string;
  userAbout: string;
  isFollow: boolean;
}

@Component({
  selector: 'app-suggestion-list',
  standalone: true,
  imports: [IonImg, IonText],
  templateUrl: './suggestion-list.component.html',
  styleUrls: ['./suggestion-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuggestionListComponent {
  suggestions = input.required<Suggestion[]>();
  toggleFollow = output<Suggestion>();
  seeAllClick = output<void>();
}
