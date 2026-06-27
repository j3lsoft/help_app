import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  IonContent,
  IonIcon,
  IonText,
  NavController,
} from '@ionic/angular/standalone';
import { BackHeaderComponent } from '@shared/components/back-header/back-header.component';
import { FollowRequestListComponent } from '../../components/follow-request-list/follow-request-list.component';
import { FollowService } from '../../services/follow.service';
import { addIcons } from 'ionicons';
import { personAddOutline } from 'ionicons/icons';

@Component({
  selector: 'app-follow-requests',
  templateUrl: './follow-requests.page.html',
  styleUrls: ['./follow-requests.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BackHeaderComponent, FollowRequestListComponent, IonContent, IonIcon, IonText],
})
export class FollowRequestsPage {
  private readonly navCtrl = inject(NavController);
  private readonly followService = inject(FollowService);

  constructor() {
    addIcons({ personAddOutline });
  }

  readonly followRequests = this.followService.followRequests;

  goBack() {
    this.navCtrl.back();
  }

  onAccept(id: string) {
    this.followService.acceptRequest(id);
  }

  onDelete(id: string) {
    this.followService.rejectRequest(id);
  }

  onToggleFollow(id: string) {
    this.followService.toggleFollowOnRequest(id);
  }
}
