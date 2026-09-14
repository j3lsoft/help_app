import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { addIcons } from 'ionicons';
import { close, createOutline } from 'ionicons/icons';
import { MediaItem } from '../../models/post-creation.model';

/** How long a touch must be held before it grabs the tile (ms). */
const LONG_PRESS_DELAY = 320;
/** Pointer travel (px) allowed during the press before it becomes a scroll. */
const MOVE_TOLERANCE = 8;
/** Duration (ms) the lifted ghost takes to snap into its destination slot. */
const SETTLE_DURATION = 200;

/** Viewport-space state for the elevated ghost that follows the pointer. */
export interface MediaDragPreview {
  src: string;
  filter: string;
  transform: string;
  width: number;
  height: number;
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
  rotate: number;
  settling: boolean;
}

@Component({
  selector: 'app-media-grid',
  standalone: true,
  imports: [CommonModule, IonIcon],
  templateUrl: './media-grid.component.html',
  styleUrls: ['./media-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MediaGridComponent {
  @Input({ required: true }) items: MediaItem[] = [];

  @Output() edit = new EventEmitter<string>();
  @Output() remove = new EventEmitter<string>();
  @Output() reorder = new EventEmitter<string[]>();

  draggedIndex = signal<number | null>(null);
  dragOverIndex = signal<number | null>(null);
  dragPreview = signal<MediaDragPreview | null>(null);

  get isDragging(): boolean {
    return this.draggedIndex() !== null;
  }

  get canReorder(): boolean {
    return this.items.length > 1;
  }

  private readonly host = inject(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  private pointerStart: { x: number; y: number } | null = null;
  private lastPointer: { x: number; y: number } | null = null;
  private pointerSourceIndex: number | null = null;
  private pointerId: number | null = null;
  private sourceRect: DOMRect | null = null;
  private longPressTimer: number | null = null;
  private suppressClick = false;
  private settleToken = 0;

  /** Blocks page scrolling only once a tile has been grabbed. */
  private readonly blockTouchScroll = (event: TouchEvent): void => {
    if (this.draggedIndex() !== null) {
      event.preventDefault();
    }
  };

  constructor() {
    addIcons({ close, createOutline });

    this.host.nativeElement.addEventListener('touchmove', this.blockTouchScroll, {
      passive: false,
    });
    this.destroyRef.onDestroy(() => {
      this.host.nativeElement.removeEventListener('touchmove', this.blockTouchScroll);
      this.clearLongPress();
    });
  }

  get gridClass(): string {
    const count = Math.min(5, Math.max(1, this.items.length));
    return `media-grid--${count}`;
  }

  getItemFilter(item: MediaItem): string {
    const base = item.filter.trim();
    const { brightness, contrast, blur, saturation, warmth } = item.edits;

    const parts: string[] = [base];

    if (brightness !== 0) parts.push(`brightness(${1 + brightness / 100})`);
    if (contrast !== 0) parts.push(`contrast(${1 + contrast / 100})`);
    if (saturation !== 0) parts.push(`saturate(${1 + saturation / 100})`);
    if (warmth !== 0) {
      if (warmth > 0) {
        parts.push(`sepia(${(warmth / 100) * 0.35}) hue-rotate(${-warmth * 0.15}deg)`);
      } else {
        parts.push(`hue-rotate(${Math.abs(warmth) * 0.2}deg)`);
      }
    }
    if (blur > 0) parts.push(`blur(${blur}px)`);

    return parts.filter(Boolean).join(' ');
  }

  getItemTransform(item: MediaItem): string {
    const { rotate } = item.edits;
    if (rotate === 0) return '';
    return `rotate(${rotate * 90}deg)`;
  }

  onCellClick(item: MediaItem, event: MouseEvent): void {
    event.stopPropagation();
    if (this.suppressClick) {
      this.suppressClick = false;
      return;
    }
    this.edit.emit(item.id);
  }

  onRemoveClick(item: MediaItem, event: MouseEvent): void {
    event.stopPropagation();
    this.remove.emit(item.id);
  }

  onDragStart(index: number, event: DragEvent): void {
    const target = event.target as HTMLElement | null;
    if (target?.closest('button')) {
      event.preventDefault();
      return;
    }
    this.suppressClick = true;
    this.draggedIndex.set(index);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', index.toString());
    }
  }

  onDragOver(index: number, event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    if (this.dragOverIndex() !== index) {
      this.dragOverIndex.set(index);
      void this.hapticTick();
    }
  }

  onDragLeave(index: number): void {
    if (this.dragOverIndex() === index) {
      this.dragOverIndex.set(null);
    }
  }

  onDrop(targetIndex: number, event: DragEvent): void {
    event.preventDefault();
    const sourceIndex = this.draggedIndex();
    this.draggedIndex.set(null);
    this.dragOverIndex.set(null);

    if (sourceIndex === null) return;
    this.commitReorder(sourceIndex, targetIndex);
  }

  onDragEnd(): void {
    this.draggedIndex.set(null);
    this.dragOverIndex.set(null);
  }

  onPointerDown(index: number, event: PointerEvent): void {
    if (!this.canReorder) return;
    // Desktop uses native HTML5 drag-and-drop; touch/pen uses long-press.
    if (event.pointerType === 'mouse') return;

    const target = event.target as HTMLElement | null;
    if (target?.closest('button')) return;

    this.suppressClick = false;
    this.pointerStart = { x: event.clientX, y: event.clientY };
    this.lastPointer = { x: event.clientX, y: event.clientY };
    this.pointerSourceIndex = index;
    this.pointerId = event.pointerId;
    const cell = (event.currentTarget as HTMLElement | null)?.closest<HTMLElement>(
      '.media-grid__cell'
    );
    this.sourceRect = cell?.getBoundingClientRect() ?? null;

    this.clearLongPress();
    this.longPressTimer = window.setTimeout(() => {
      this.longPressTimer = null;
      if (this.lastPointer) {
        this.beginPointerDrag(this.lastPointer);
      }
    }, LONG_PRESS_DELAY);
  }

  onPointerMove(event: PointerEvent): void {
    if (event.pointerType === 'mouse') return;

    if (this.draggedIndex() === null) {
      if (this.pointerStart === null) return;
      this.lastPointer = { x: event.clientX, y: event.clientY };
      const dx = event.clientX - this.pointerStart.x;
      const dy = event.clientY - this.pointerStart.y;
      if (Math.hypot(dx, dy) > MOVE_TOLERANCE) {
        // The finger is scrolling, not holding: let the gesture go.
        this.clearLongPress();
      }
      return;
    }

    event.preventDefault();
    this.trackPreview(event);

    const overCell = this.cellAtPoint(event.clientX, event.clientY);
    if (overCell !== null && overCell !== this.dragOverIndex()) {
      this.dragOverIndex.set(overCell);
      void this.hapticTick();
    }
  }

  onPointerUp(event: PointerEvent): void {
    if (event.pointerType === 'mouse') return;
    this.clearLongPress();

    const sourceIndex = this.draggedIndex();
    const targetIndex = this.dragOverIndex();
    this.releasePointer();
    this.resetPointer();

    if (sourceIndex === null) {
      this.dragPreview.set(null);
      return;
    }

    this.suppressClick = true;
    this.settlePreview(targetIndex ?? sourceIndex);
    this.commitReorder(sourceIndex, targetIndex ?? sourceIndex);
  }

  onPointerCancel(event: PointerEvent): void {
    if (event.pointerType === 'mouse') return;
    this.clearLongPress();
    this.releasePointer();
    this.resetPointer();
    this.dragPreview.set(null);
  }

  private beginPointerDrag(point: { x: number; y: number }): void {
    const index = this.pointerSourceIndex;
    if (index === null) return;
    const item = this.items[index];
    if (!item) return;

    const rect = this.sourceRect;
    const width = rect?.width ?? 120;
    const height = rect?.height ?? 120;
    const offsetX = rect ? point.x - rect.left : width / 2;
    const offsetY = rect ? point.y - rect.top : height / 2;

    this.draggedIndex.set(index);
    this.dragPreview.set({
      src: item.image.src,
      filter: this.getItemFilter(item),
      transform: this.getItemTransform(item),
      width,
      height,
      x: point.x - offsetX,
      y: point.y - offsetY,
      offsetX,
      offsetY,
      rotate: 1.6,
      settling: false,
    });

    this.capturePointer();
    void this.hapticLift();
  }

  private trackPreview(event: PointerEvent): void {
    const preview = this.dragPreview();
    if (!preview || preview.settling) return;

    this.dragPreview.set({
      ...preview,
      x: event.clientX - preview.offsetX,
      y: event.clientY - preview.offsetY,
    });
  }

  private settlePreview(targetIndex: number): void {
    const preview = this.dragPreview();
    const cell = this.cellElement(targetIndex);
    if (!preview || !cell) {
      this.dragPreview.set(null);
      return;
    }

    const rect = cell.getBoundingClientRect();
    const token = ++this.settleToken;
    this.dragPreview.set({
      ...preview,
      x: rect.left,
      y: rect.top,
      offsetX: 0,
      offsetY: 0,
      width: rect.width,
      height: rect.height,
      rotate: 0,
      settling: true,
    });

    window.setTimeout(() => {
      if (token === this.settleToken) {
        this.dragPreview.set(null);
      }
    }, SETTLE_DURATION);
  }

  private commitReorder(sourceIndex: number, targetIndex: number): void {
    if (sourceIndex === targetIndex) return;
    if (sourceIndex < 0 || sourceIndex >= this.items.length) return;
    if (targetIndex < 0 || targetIndex >= this.items.length) return;

    const newItems = [...this.items];
    const [moved] = newItems.splice(sourceIndex, 1);
    newItems.splice(targetIndex, 0, moved);

    this.reorder.emit(newItems.map((i) => i.id));
  }

  private cellAtPoint(clientX: number, clientY: number): number | null {
    const element = document.elementFromPoint(clientX, clientY);
    const cell = element?.closest<HTMLElement>('.media-grid__cell[data-index]');
    if (!cell) return null;

    const index = Number(cell.dataset['index']);
    return Number.isNaN(index) ? null : index;
  }

  private cellElement(index: number): HTMLElement | null {
    const root = this.host.nativeElement as HTMLElement;
    return root.querySelector(`.media-grid__cell[data-index="${index}"]`);
  }

  private resetPointer(): void {
    this.pointerStart = null;
    this.lastPointer = null;
    this.pointerSourceIndex = null;
    this.pointerId = null;
    this.sourceRect = null;
    this.draggedIndex.set(null);
    this.dragOverIndex.set(null);
  }

  private clearLongPress(): void {
    if (this.longPressTimer !== null) {
      window.clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  private capturePointer(): void {
    const target =
      this.pointerSourceIndex !== null
        ? this.cellElement(this.pointerSourceIndex)
        : null;
    if (!target || this.pointerId === null) return;
    try {
      target.setPointerCapture(this.pointerId);
    } catch {
      // Pointer capture is a progressive enhancement; ignore unsupported cases.
    }
  }

  private releasePointer(): void {
    const target =
      this.pointerSourceIndex !== null
        ? this.cellElement(this.pointerSourceIndex)
        : null;
    if (!target || this.pointerId === null) return;
    try {
      target.releasePointerCapture(this.pointerId);
    } catch {
      // Capture may not have been acquired; nothing to release.
    }
  }

  private async hapticLift(): Promise<void> {
    try {
      if (Capacitor.isNativePlatform()) {
        await Haptics.impact({ style: ImpactStyle.Medium });
      }
    } catch {
      // Haptics are best-effort; never block the gesture.
    }
  }

  private async hapticTick(): Promise<void> {
    try {
      if (Capacitor.isNativePlatform()) {
        await Haptics.selectionChanged();
      }
    } catch {
      // Haptics are best-effort; never block the gesture.
    }
  }
}
