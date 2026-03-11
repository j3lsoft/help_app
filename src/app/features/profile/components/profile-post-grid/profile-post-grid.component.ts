import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { IonIcon, IonImg } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { playOutline } from 'ionicons/icons';

export interface PostItem {
  id: string;
  image: string;
  views?: string;
}

@Component({
  selector: 'app-profile-post-grid',
  templateUrl: './profile-post-grid.component.html',
  styleUrls: ['./profile-post-grid.component.scss'],
  standalone: true,
  imports: [IonImg, IonIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePostGridComponent {
  posts = input.required<PostItem[]>();
  onPostClick = output<PostItem>();

  constructor() {
    addIcons({ playOutline });
  }
}
