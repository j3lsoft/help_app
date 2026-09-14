import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonImg,
  IonRange,
  IonText,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  colorPaletteOutline,
  contrastOutline,
  ellipseOutline,
  optionsOutline,
  refreshOutline,
  scanOutline,
  sunnyOutline,
  syncOutline,
  thermometerOutline,
  triangleOutline,
  waterOutline,
} from 'ionicons/icons';
import { BackHeaderComponent } from '@shared/components/back-header/back-header.component';
import { POST_FILTER_OPTIONS } from '../../data/posts.mock';
import { PostEditKey, PostEditState } from '../../models/post-creation.model';
import { PostCreationService } from '../../services/post-creation.service';

export type PhotoEditorTab = 'filters' | 'adjust' | 'rotate';

export interface AdjustControl {
  key: PostEditKey;
  icon: string;
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  unit?: string;
}

@Component({
  selector: 'app-photo-editor',
  templateUrl: './photo-editor.component.html',
  styleUrls: ['./photo-editor.component.scss'],
  standalone: true,
  imports: [
    BackHeaderComponent,
    CommonModule,
    IonButton,
    IonIcon,
    IonImg,
    IonRange,
    IonText,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhotoEditorComponent {
  private readonly postCreation = inject(PostCreationService);
  readonly done = output<void>();

  readonly filters = POST_FILTER_OPTIONS;

  readonly selectedImageSrc = this.postCreation.selectedImageSrc;
  readonly selectedFilter = this.postCreation.selectedFilter;
  readonly selectedEdits = this.postCreation.selectedEdits;
  readonly effectiveFilter = this.postCreation.effectiveFilter;
  readonly effectiveTransform = this.postCreation.effectiveTransform;

  readonly activeTab = signal<PhotoEditorTab>('filters');

  readonly hasNonNeutralVisuals = computed(() => {
    const filter = this.selectedFilter();
    const edits = this.selectedEdits();
    return (
      filter !== '' ||
      edits.brightness !== 0 ||
      edits.contrast !== 0 ||
      edits.blur !== 0 ||
      edits.rotate !== 0 ||
      edits.saturation !== 0 ||
      edits.warmth !== 0 ||
      edits.vignette !== 0 ||
      edits.sharpen !== 0
    );
  });

  readonly adjustControls = computed<AdjustControl[]>(() => {
    const edits = this.selectedEdits();
    return [
      {
        key: 'brightness',
        icon: 'sunny-outline',
        label: 'Brightness',
        min: -100,
        max: 100,
        step: 1,
        value: edits.brightness,
      },
      {
        key: 'contrast',
        icon: 'contrast-outline',
        label: 'Contrast',
        min: -100,
        max: 100,
        step: 1,
        value: edits.contrast,
      },
      {
        key: 'saturation',
        icon: 'water-outline',
        label: 'Saturation',
        min: -100,
        max: 100,
        step: 1,
        value: edits.saturation,
      },
      {
        key: 'warmth',
        icon: 'thermometer-outline',
        label: 'Warmth',
        min: -100,
        max: 100,
        step: 1,
        value: edits.warmth,
      },
      {
        key: 'blur',
        icon: 'ellipse-outline',
        label: 'Blur',
        min: 0,
        max: 10,
        step: 1,
        value: edits.blur,
        unit: 'px',
      },
      {
        key: 'vignette',
        icon: 'scan-outline',
        label: 'Vignette',
        min: 0,
        max: 100,
        step: 1,
        value: edits.vignette,
      },
      {
        key: 'sharpen',
        icon: 'triangle-outline',
        label: 'Sharpen',
        min: 0,
        max: 100,
        step: 1,
        value: edits.sharpen,
      },
    ];
  });

  constructor() {
    addIcons({
      colorPaletteOutline,
      contrastOutline,
      ellipseOutline,
      optionsOutline,
      refreshOutline,
      scanOutline,
      sunnyOutline,
      syncOutline,
      thermometerOutline,
      triangleOutline,
      waterOutline,
    });
  }

  closeEditor(): void {
    this.done.emit();
  }

  setTab(tab: PhotoEditorTab): void {
    this.activeTab.set(tab);
  }

  selectFilter(filterCss: string): void {
    this.postCreation.setFilter(filterCss);
  }

  isFilterActive(filterCss: string): boolean {
    return this.selectedFilter() === filterCss;
  }

  onAdjustChange(key: PostEditKey, event: CustomEvent): void {
    const value = Number((event.detail as { value: number }).value);
    this.postCreation.updateEdit(key, value);
  }

  rotateClockwise(): void {
    const current = this.selectedEdits().rotate;
    this.postCreation.setEdit({ rotate: (current + 1) % 4 });
  }

  resetRotate(): void {
    this.postCreation.resetEdit('rotate');
  }

  resetAll(): void {
    this.postCreation.resetAll();
  }
}