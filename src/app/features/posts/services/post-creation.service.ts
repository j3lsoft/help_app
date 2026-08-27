import { Injectable, computed, signal } from '@angular/core';
import {
  POST_EDIT_STATE_NEUTRAL,
  PostEditKey,
  PostEditState,
  SelectedPostImage,
} from '../models/post-creation.model';

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

function toBrightnessFilter(value: number): string {
  if (value === 0) return '';
  return `brightness(${1 + value / 100})`;
}

function toContrastFilter(value: number): string {
  if (value === 0) return '';
  return `contrast(${1 + value / 100})`;
}

function toBlurFilter(value: number): string {
  if (value === 0) return '';
  return `blur(${value}px)`;
}

@Injectable({
  providedIn: 'root',
})
export class PostCreationService {
  private readonly _image = signal<SelectedPostImage | null>(null);
  private readonly _selectedFilter = signal<string>('');
  private readonly _edits = signal<PostEditState>({ ...POST_EDIT_STATE_NEUTRAL });
  private readonly _pendingMediaId = signal<string | null>(null);

  readonly selectedImageSrc = computed(() => this._image()?.src ?? '');
  readonly hasSelectedImage = computed(() => this._image() !== null);
  readonly selectedFilter = this._selectedFilter.asReadonly();
  readonly selectedEdits = this._edits.asReadonly();
  readonly pendingMediaId = this._pendingMediaId.asReadonly();

  readonly effectiveFilter = computed(() => {
    const base = this._selectedFilter().trim();
    const { brightness, contrast, blur } = this._edits();
    const parts = [
      base,
      toBrightnessFilter(brightness),
      toContrastFilter(contrast),
      toBlurFilter(blur),
    ].filter(Boolean);
    return parts.join(' ');
  });

  readonly effectiveTransform = computed(() => {
    const { rotate } = this._edits();
    if (rotate === 0) return '';
    return `rotate(${rotate * 90}deg)`;
  });

  selectImage(image: SelectedPostImage): void {
    this._image.set(image);
    this._selectedFilter.set('');
    this._edits.set({ ...POST_EDIT_STATE_NEUTRAL });
    this._pendingMediaId.set(null);
  }

  setFilter(filterCss: string): void {
    const next = filterCss ?? '';
    const current = this._selectedFilter();
    if (next === current) return;
    this._selectedFilter.set(next);
    this._pendingMediaId.set(null);
  }

  setEdit(patch: Partial<PostEditState>): void {
    const current = this._edits();
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

    if (!changed) return;
    this._edits.set(next);
    this._pendingMediaId.set(null);
  }

  updateEdit(key: PostEditKey, value: number): void {
    this.setEdit({ [key]: value } as Partial<PostEditState>);
  }

  resetEdit(key: PostEditKey): void {
    const current = this._edits();
    const neutral = POST_EDIT_STATE_NEUTRAL[key];
    if (current[key] === neutral) return;
    this._edits.set({ ...current, [key]: neutral });
    this._pendingMediaId.set(null);
  }

  resetAll(): void {
    const hasFilter = this._selectedFilter() !== '';
    const edits = this._edits();
    const hasEdits =
      edits.brightness !== 0 ||
      edits.contrast !== 0 ||
      edits.blur !== 0 ||
      edits.rotate !== 0;
    if (!hasFilter && !hasEdits) return;
    if (hasFilter) this._selectedFilter.set('');
    if (hasEdits) this._edits.set({ ...POST_EDIT_STATE_NEUTRAL });
    this._pendingMediaId.set(null);
  }

  setPendingMediaId(mediaFileId: string | null): void {
    this._pendingMediaId.set(mediaFileId);
  }

  reset(): void {
    this._image.set(null);
    this._selectedFilter.set('');
    this._edits.set({ ...POST_EDIT_STATE_NEUTRAL });
    this._pendingMediaId.set(null);
  }
}
