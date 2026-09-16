import { Injectable, computed, signal } from '@angular/core';
import {
  MAX_MEDIA_ITEMS,
  MediaItem,
  POST_EDIT_STATE_NEUTRAL,
  PostEditKey,
  PostEditState,
  SelectedPostImage,
} from '../models/post-creation.model';
import {
  buildEffectiveFilterCssForItem,
  buildEffectiveTransformCssForItem,
} from '../utils/post-effective-filter.util';

function revokeWebObjectUrl(image: SelectedPostImage): void {
  if (image.origin !== 'web' || !image.src.startsWith('blob:')) {
    return;
  }
  try {
    URL.revokeObjectURL(image.src);
  } catch {
    // Best-effort cleanup
  }
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'media-' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

function clampBrightness(value: number): number {
  return Math.max(-100, Math.min(100, Math.round(value)));
}

function clampContrast(value: number): number {
  return Math.max(-100, Math.min(100, Math.round(value)));
}

function clampBlur(value: number): number {
  return Math.max(0, Math.min(10, value));
}

function clampRotate(value: number): number {
  return ((Math.round(value) % 4) + 4) % 4;
}

function clampSaturation(value: number): number {
  return Math.max(-100, Math.min(100, Math.round(value)));
}

function clampWarmth(value: number): number {
  return Math.max(-100, Math.min(100, Math.round(value)));
}

function clampVignette(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function clampSharpen(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

@Injectable({
  providedIn: 'root',
})
export class PostCreationService {
  private readonly _items = signal<MediaItem[]>([]);
  private readonly _activeItemId = signal<string | null>(null);

  readonly mediaItems = this._items.asReadonly();
  readonly activeItemId = this._activeItemId.asReadonly();

  readonly activeItem = computed(() => {
    const items = this._items();
    const activeId = this._activeItemId();
    if (!activeId) return items[0] ?? null;
    return items.find((item) => item.id === activeId) ?? items[0] ?? null;
  });

  readonly hasMedia = computed(() => this._items().length > 0);
  readonly canAddMedia = computed(() => this._items().length < MAX_MEDIA_ITEMS);
  readonly mediaCount = computed(() => this._items().length);
  readonly remainingSlots = computed(() => MAX_MEDIA_ITEMS - this._items().length);

  // Backward compatibility & convenience signals delegating to active item
  readonly selectedImageSrc = computed(() => this.activeItem()?.image.src ?? '');
  readonly selectedFilter = computed(() => this.activeItem()?.filter ?? '');
  readonly selectedEdits = computed(
    () => this.activeItem()?.edits ?? { ...POST_EDIT_STATE_NEUTRAL }
  );
  readonly pendingMediaId = computed(() => this.activeItem()?.pendingMediaId ?? null);

  readonly effectiveFilter = computed(() => {
    const item = this.activeItem();
    if (!item) return '';
    return buildEffectiveFilterCssForItem(item);
  });

  readonly effectiveTransform = computed(() => {
    const item = this.activeItem();
    if (!item) return '';
    return buildEffectiveTransformCssForItem(item);
  });

  addImage(image: SelectedPostImage): string | null {
    if (!this.canAddMedia()) return null;
    const newItem: MediaItem = {
      id: generateId(),
      image,
      filter: '',
      edits: { ...POST_EDIT_STATE_NEUTRAL },
      pendingMediaId: null,
    };
    this._items.update((items) => [...items, newItem]);
    if (this._items().length === 1 || !this._activeItemId()) {
      this._activeItemId.set(newItem.id);
    }
    return newItem.id;
  }

  addImages(images: SelectedPostImage[]): string[] {
    const slots = this.remainingSlots();
    if (slots <= 0) return [];
    const toAdd = images.slice(0, slots);
    const addedIds: string[] = [];
    const newItems: MediaItem[] = toAdd.map((image) => {
      const id = generateId();
      addedIds.push(id);
      return {
        id,
        image,
        filter: '',
        edits: { ...POST_EDIT_STATE_NEUTRAL },
        pendingMediaId: null,
      };
    });

    this._items.update((items) => [...items, ...newItems]);
    if (newItems.length > 0 && !this._activeItemId()) {
      this._activeItemId.set(newItems[0].id);
    }
    return addedIds;
  }

  removeItem(id: string): void {
    const currentItems = this._items();
    const index = currentItems.findIndex((item) => item.id === id);
    if (index === -1) return;

    revokeWebObjectUrl(currentItems[index].image);

    const remaining = currentItems.filter((item) => item.id !== id);
    this._items.set(remaining);

    if (this._activeItemId() === id) {
      if (remaining.length === 0) {
        this._activeItemId.set(null);
      } else {
        const nextIndex = Math.min(index, remaining.length - 1);
        this._activeItemId.set(remaining[nextIndex].id);
      }
    }
  }

  reorderItems(orderedIds: string[]): void {
    const currentItems = this._items();
    const itemMap = new Map(currentItems.map((item) => [item.id, item]));
    const reordered: MediaItem[] = [];

    for (const id of orderedIds) {
      const item = itemMap.get(id);
      if (item) {
        reordered.push(item);
        itemMap.delete(id);
      }
    }
    // Append any items not included in orderedIds
    for (const item of itemMap.values()) {
      reordered.push(item);
    }

    this._items.set(reordered);
  }

  setActiveItem(id: string | null): void {
    if (id === null) {
      this._activeItemId.set(null);
      return;
    }
    const exists = this._items().some((item) => item.id === id);
    if (exists) {
      this._activeItemId.set(id);
    }
  }

  /** Single-image backward compatible API */
  setFilter(filterCss: string): void {
    const active = this.activeItem();
    if (!active) return;
    const next = filterCss ?? '';
    if (active.filter === next) return;

    this.updateActiveItem((item) => ({
      ...item,
      filter: next,
      pendingMediaId: null,
    }));
  }

  setEdit(patch: Partial<PostEditState>): void {
    const active = this.activeItem();
    if (!active) return;

    const current = active.edits;
    const next: PostEditState = { ...current };
    let changed = false;

    if (patch.brightness !== undefined) {
      const clamped = clampBrightness(patch.brightness);
      if (clamped !== current.brightness) {
        next.brightness = clamped;
        changed = true;
      }
    }
    if (patch.contrast !== undefined) {
      const clamped = clampContrast(patch.contrast);
      if (clamped !== current.contrast) {
        next.contrast = clamped;
        changed = true;
      }
    }
    if (patch.blur !== undefined) {
      const clamped = clampBlur(patch.blur);
      if (clamped !== current.blur) {
        next.blur = clamped;
        changed = true;
      }
    }
    if (patch.rotate !== undefined) {
      const clamped = clampRotate(patch.rotate);
      if (clamped !== current.rotate) {
        next.rotate = clamped;
        changed = true;
      }
    }
    if (patch.saturation !== undefined) {
      const clamped = clampSaturation(patch.saturation);
      if (clamped !== current.saturation) {
        next.saturation = clamped;
        changed = true;
      }
    }
    if (patch.warmth !== undefined) {
      const clamped = clampWarmth(patch.warmth);
      if (clamped !== current.warmth) {
        next.warmth = clamped;
        changed = true;
      }
    }
    if (patch.vignette !== undefined) {
      const clamped = clampVignette(patch.vignette);
      if (clamped !== current.vignette) {
        next.vignette = clamped;
        changed = true;
      }
    }
    if (patch.sharpen !== undefined) {
      const clamped = clampSharpen(patch.sharpen);
      if (clamped !== current.sharpen) {
        next.sharpen = clamped;
        changed = true;
      }
    }

    if (!changed) return;

    this.updateActiveItem((item) => ({
      ...item,
      edits: next,
      pendingMediaId: null,
    }));
  }

  updateEdit(key: PostEditKey, value: number): void {
    this.setEdit({ [key]: value } as Partial<PostEditState>);
  }

  resetEdit(key: PostEditKey): void {
    const active = this.activeItem();
    if (!active) return;
    const neutral = POST_EDIT_STATE_NEUTRAL[key];
    if (active.edits[key] === neutral) return;

    this.updateActiveItem((item) => ({
      ...item,
      edits: { ...item.edits, [key]: neutral },
      pendingMediaId: null,
    }));
  }

  resetAll(): void {
    const active = this.activeItem();
    if (!active) return;
    const hasFilter = active.filter !== '';
    const edits = active.edits;
    const hasEdits =
      edits.brightness !== 0 ||
      edits.contrast !== 0 ||
      edits.blur !== 0 ||
      edits.rotate !== 0 ||
      edits.saturation !== 0 ||
      edits.warmth !== 0 ||
      edits.vignette !== 0 ||
      edits.sharpen !== 0;

    if (!hasFilter && !hasEdits) return;

    this.updateActiveItem((item) => ({
      ...item,
      filter: '',
      edits: { ...POST_EDIT_STATE_NEUTRAL },
      pendingMediaId: null,
    }));
  }

  setPendingMediaId(mediaFileId: string | null): void {
    const active = this.activeItem();
    if (!active) return;
    this.updateActiveItem((item) => ({
      ...item,
      pendingMediaId: mediaFileId,
    }));
  }

  setItemPendingMediaId(id: string, mediaFileId: string | null): void {
    this._items.update((items) =>
      items.map((item) => (item.id === id ? { ...item, pendingMediaId: mediaFileId } : item))
    );
  }

  reset(): void {
    for (const item of this._items()) {
      revokeWebObjectUrl(item.image);
    }
    this._items.set([]);
    this._activeItemId.set(null);
  }

  private updateActiveItem(updater: (item: MediaItem) => MediaItem): void {
    const active = this.activeItem();
    if (!active) return;
    this._items.update((items) =>
      items.map((item) => (item.id === active.id ? updater(item) : item))
    );
  }
}
