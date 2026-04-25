import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { IonSegment, IonSegmentButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-profile-tabs',
  templateUrl: './profile-tabs.component.html',
  styleUrls: ['./profile-tabs.component.scss'],
  imports: [IonSegment, IonSegmentButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileTabsComponent {
  selectedTab = input.required<'All' | 'Videos' | 'Tags'>();
  tabChange = output<'All' | 'Videos' | 'Tags'>();

  onTabChange(event: any) {
    this.tabChange.emit(event.detail.value as 'All' | 'Videos' | 'Tags');
  }
}
