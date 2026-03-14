import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import {
    IonButtons,
    IonContent,
    IonHeader,
    IonMenuButton,
    IonText,
    IonToolbar,
} from '@ionic/angular/standalone';
import { ProfileHeaderComponent } from '../../components/profile-header/profile-header.component';
import {
    ProfilePostGridComponent
} from '../../components/profile-post-grid/profile-post-grid.component';
import { ProfileTabsComponent } from '../../components/profile-tabs/profile-tabs.component';
import {
    MOCK_ALL_POSTS,
    MOCK_TAGGED_POSTS,
    MOCK_USER_PROFILE,
    MOCK_VIDEO_POSTS,
} from '../../data/profile.mock';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonText,
    IonMenuButton,
    IonContent,
    ProfileHeaderComponent,
    ProfileTabsComponent,
    ProfilePostGridComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePage {
  private navCtrl = inject(NavController);
  private router = inject(Router);

  // State Signals
  selectedTab = signal<string>('All');
  isStoryAvailable = signal<boolean>(false);

  // Derived Data
  displayPosts = computed(() => {
    switch (this.selectedTab()) {
      case 'Videos':
        return MOCK_VIDEO_POSTS;
      case 'Tags':
        return MOCK_TAGGED_POSTS;
      default:
        return MOCK_ALL_POSTS;
    }
  });

  // User Stats (Placeholder as in original)
  userProfile = signal(MOCK_USER_PROFILE);

  goBack() {
    this.navCtrl.back();
  }

  goTo(screen: string) {
    this.router.navigateByUrl(screen);
  }

  onTabChange(tab: string) {
    this.selectedTab.set(tab);
  }
}
