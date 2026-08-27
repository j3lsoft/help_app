import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonImg,
  IonRange,
  IonSegment,
  IonSegmentButton,
  IonText,
  IonToolbar,
  NavController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowForwardOutline,
  chevronBack,
  closeOutline,
  refreshOutline,
} from 'ionicons/icons';
import { POST_EDIT_OPTIONS, POST_FILTER_OPTIONS } from '../../data/posts.mock';
import {
  PostEditKey,
  PostEditOption,
  PostFilterTab,
} from '../../models/post-creation.model';
import { PostCreationService } from '../../services/post-creation.service';

@Component({
  selector: 'app-post-filter',
  templateUrl: './post-filter.page.html',
  styleUrls: ['./post-filter.page.scss'],
  imports: [
    IonButton,
    IonContent,
    IonHeader,
    IonIcon,
    IonImg,
    IonRange,
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
  readonly effectiveFilter = this.postCreation.effectiveFilter;
  readonly effectiveTransform = this.postCreation.effectiveTransform;
  readonly selectedEdits = this.postCreation.selectedEdits;
  readonly selectedTab = signal<PostFilterTab>('Filter');
  readonly activeEdit = signal<PostEditKey | null>(null);

  readonly hasNonNeutralVisuals = computed(() => {
    const filter = this.selectedFilter();
    const edits = this.selectedEdits();
    return (
      filter !== '' ||
      edits.brightness !== 0 ||
      edits.contrast !== 0 ||
      edits.blur !== 0 ||
      edits.rotate !== 0
    );
  });

  private readonly enabledEditMap: Record<string, PostEditKey> = {
    Brightness: 'brightness',
    Contrast: 'contrast',
    Blur: 'blur',
    Rotate: 'rotate',
  };

  private readonly disabledOptionNames = new Set<string>(['Adjust', 'Curves', 'Crop', 'Perspective']);

  constructor() {
    addIcons({ chevronBack, arrowForwardOutline, closeOutline, refreshOutline });
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
    if (event.detail.value !== 'Edit') {
      this.activeEdit.set(null);
    }
  }

  isEditEnabled(option: PostEditOption): boolean {
    return option.optionName in this.enabledEditMap;
  }

  isEditDisabled(option: PostEditOption): boolean {
    return this.disabledOptionNames.has(option.optionName);
  }

  isEditActive(option: PostEditOption): boolean {
    const key = this.enabledEditMap[option.optionName];
    return key !== undefined && this.activeEdit() === key;
  }

  hasEditValue(option: PostEditOption): boolean {
    const key = this.enabledEditMap[option.optionName];
    if (!key) return false;
    const val = this.selectedEdits()[key];
    return val !== 0;
  }

  isFilterActive(filterCss: string): boolean {
    return this.selectedFilter() === filterCss;
  }

  openEdit(option: PostEditOption): void {
    if (!this.isEditEnabled(option)) return;
    const key = this.enabledEditMap[option.optionName] as PostEditKey;
    this.activeEdit.set(key);
  }

  closeEdit(): void {
    this.activeEdit.set(null);
  }

  onBrightnessChange(event: CustomEvent): void {
    const value = Number((event.detail as { value: number }).value);
    this.postCreation.setEdit({ brightness: value });
  }

  onContrastChange(event: CustomEvent): void {
    const value = Number((event.detail as { value: number }).value);
    this.postCreation.setEdit({ contrast: value });
  }

  onBlurChange(event: CustomEvent): void {
    const value = Number((event.detail as { value: number }).value);
    this.postCreation.setEdit({ blur: value });
  }

  rotateClockwise(): void {
    const current = this.selectedEdits().rotate;
    this.postCreation.setEdit({ rotate: (current + 1) % 4 });
  }

  resetRotate(): void {
    this.postCreation.resetEdit('rotate');
  }

  resetActiveEdit(): void {
    const key = this.activeEdit();
    if (key) this.postCreation.resetEdit(key);
  }

  resetAll(): void {
    this.postCreation.resetAll();
    this.activeEdit.set(null);
  }
}
