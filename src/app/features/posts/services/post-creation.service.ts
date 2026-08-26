import { Injectable, computed, inject, signal } from '@angular/core';
import { SelectedPostImage } from '../models/post-creation.model';

@Injectable({
  providedIn: 'root',
})
export class PostCreationService {
  private readonly _image = signal<SelectedPostImage | null>(null);
  private readonly _selectedFilter = signal<string>('');
  private readonly _pendingMediaId = signal<string | null>(null);

  readonly selectedImageSrc = computed(() => this._image()?.src ?? '');
  readonly hasSelectedImage = computed(() => this._image() !== null);
  readonly selectedFilter = this._selectedFilter.asReadonly();
  readonly pendingMediaId = this._pendingMediaId.asReadonly();

  selectImage(image: SelectedPostImage): void {
    this._image.set(image);
    this._selectedFilter.set('');
    this._pendingMediaId.set(null);
  }

  setFilter(filterCss: string): void {
    this._selectedFilter.set(filterCss);
  }

  setPendingMediaId(mediaFileId: string | null): void {
    this._pendingMediaId.set(mediaFileId);
  }

  reset(): void {
    this._image.set(null);
    this._selectedFilter.set('');
    this._pendingMediaId.set(null);
  }
}
