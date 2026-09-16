import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { IonImg } from '@ionic/angular/standalone';
import { ProfileMediaItem } from '../../models/profile-media-item.model';

@Component({
  selector: 'app-profile-media-grid',
  templateUrl: './profile-media-grid.component.html',
  styleUrls: ['./profile-media-grid.component.scss'],
  imports: [IonImg],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileMediaGridComponent {
  media = input.required<ProfileMediaItem[]>();
  /** Index of the tapped media within the flattened list (for the lightbox). */
  mediaClick = output<number>();
}
