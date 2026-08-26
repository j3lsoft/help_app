import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonIcon,
  IonImg,
  IonSegment,
  IonSegmentButton,
  IonText,
  IonToolbar,
  NavController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowForwardOutline, chevronBack } from 'ionicons/icons';
import { POST_EDIT_OPTIONS, POST_FILTER_OPTIONS } from '../../data/posts.mock';
import { PostFilterTab } from '../../models/post-creation.model';
import { PostCreationService } from '../../services/post-creation.service';

@Component({
  selector: 'app-post-filter',
  templateUrl: './post-filter.page.html',
  styleUrls: ['./post-filter.page.scss'],
  imports: [
    IonContent,
    IonHeader,
    IonIcon,
    IonImg,
    IonSegment,
    IonSegmentButton,
    IonText,
    IonToolbar,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostFilterPage {
  private readonly navCtrl = inject(NavController);
  private readonly router = inject(Router);
  readonly postCreation = inject(PostCreationService);

  readonly filters = POST_FILTER_OPTIONS;
  readonly editOptions = POST_EDIT_OPTIONS;

  readonly selectedImageSrc = this.postCreation.selectedImageSrc;
  readonly selectedFilter = this.postCreation.selectedFilter;
  readonly selectedTab = signal<PostFilterTab>('Filter');

  constructor() {
    addIcons({ chevronBack, arrowForwardOutline });
    if (!this.postCreation.hasSelectedImage()) {
      this.navCtrl.back();
    }
  }

  goBack(): void {
    this.navCtrl.back();
  }

  goToCaptionAndTag(): void {
    this.router.navigate(['/post-caption-and-tag']);
  }

  selectFilter(filterCss: string): void {
    this.postCreation.setFilter(filterCss);
  }

  onTabChange(event: CustomEvent): void {
    this.selectedTab.set(event.detail.value as PostFilterTab);
  }
}
