import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { IonSegment, IonSegmentButton } from '@ionic/angular/standalone';
import type { TabValue } from '../../utils/post-filter.utils';

@Component({
  selector: 'app-profile-tabs',
  templateUrl: './profile-tabs.component.html',
  styleUrls: ['./profile-tabs.component.scss'],
  imports: [IonSegment, IonSegmentButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileTabsComponent {
  selectedTab = input.required<TabValue>();
  tabChange = output<TabValue>();

  onTabChange(event: CustomEvent) {
    this.tabChange.emit(event.detail.value as TabValue);
  }
}
