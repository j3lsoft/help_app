import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { IonIcon, IonImg } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { playOutline } from 'ionicons/icons';
import { PostItem } from '../../models/post-item.model';

export { PostItem };

@Component({
  selector: 'app-profile-post-grid',
  templateUrl: './profile-post-grid.component.html',
  styleUrls: ['./profile-post-grid.component.scss'],
  imports: [IonImg, IonIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePostGridComponent {
  posts = input.required<PostItem[]>();
  postClick = output<PostItem>();

  constructor() {
    addIcons({ playOutline });
  }

  trackByPostId(index: number, item: PostItem): string {
    return item.id;
  }
}
