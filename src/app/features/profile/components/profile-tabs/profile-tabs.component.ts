import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { IonIcon, IonSegment, IonSegmentButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { gridOutline, imagesOutline } from 'ionicons/icons';
import type { ProfileTab } from '../../models/profile-tab.model';

@Component({
  selector: 'app-profile-tabs',
  templateUrl: './profile-tabs.component.html',
  styleUrls: ['./profile-tabs.component.scss'],
  imports: [IonSegment, IonSegmentButton, IonIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileTabsComponent {
  selectedTab = input.required<ProfileTab>();
  tabChange = output<ProfileTab>();

  constructor() {
    addIcons({ gridOutline, imagesOutline });
  }

  onTabChange(event: CustomEvent) {
    this.tabChange.emit(event.detail.value as ProfileTab);
  }
}
