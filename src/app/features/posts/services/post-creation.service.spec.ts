import { PostCreationService } from './post-creation.service';
import { MAX_MEDIA_ITEMS, POST_EDIT_STATE_NEUTRAL } from '../models/post-creation.model';

describe('PostCreationService - Multi-Media & Edit State', () => {
  let svc: PostCreationService;

  beforeEach(() => {
    svc = new PostCreationService();
  });

  it('should start empty with neutral states', () => {
    expect(svc.hasMedia()).toBeFalse();
    expect(svc.mediaCount()).toBe(0);
    expect(svc.canAddMedia()).toBeTrue();
    expect(svc.remainingSlots()).toBe(MAX_MEDIA_ITEMS);
    expect(svc.activeItem()).toBeNull();
    expect(svc.effectiveFilter()).toBe('');
    expect(svc.effectiveTransform()).toBe('');
  });

  it('should add images up to MAX_MEDIA_ITEMS limit', () => {
    const img = { src: 'blob:a', format: 'jpeg', origin: 'gallery' as const };
    const ids: string[] = [];
    for (let i = 0; i < MAX_MEDIA_ITEMS; i++) {
      const id = svc.addImage(img);
      expect(id).not.toBeNull();
      ids.push(id!);
    }

    expect(svc.mediaCount()).toBe(MAX_MEDIA_ITEMS);
    expect(svc.canAddMedia()).toBeFalse();
    expect(svc.remainingSlots()).toBe(0);

    // 6th image should be rejected
    const extraId = svc.addImage(img);
    expect(extraId).toBeNull();
    expect(svc.mediaCount()).toBe(MAX_MEDIA_ITEMS);
  });

  it('should add batch of images respecting remaining slots', () => {
    const imgs = [
      { src: 'blob:1', format: 'jpeg', origin: 'gallery' as const },
      { src: 'blob:2', format: 'jpeg', origin: 'gallery' as const },
      { src: 'blob:3', format: 'jpeg', origin: 'gallery' as const },
      { src: 'blob:4', format: 'jpeg', origin: 'gallery' as const },
      { src: 'blob:5', format: 'jpeg', origin: 'gallery' as const },
      { src: 'blob:6', format: 'jpeg', origin: 'gallery' as const },
    ];

    const added = svc.addImages(imgs);
    expect(added.length).toBe(5);
    expect(svc.mediaCount()).toBe(5);
  });

  it('should switch active item and keep edits independent', () => {
    const id1 = svc.addImage({ src: 'blob:1', format: 'jpeg', origin: 'gallery' })!;
    const id2 = svc.addImage({ src: 'blob:2', format: 'jpeg', origin: 'gallery' })!;

    expect(svc.activeItemId()).toBe(id1);

    svc.setFilter('grayscale(1)');
    svc.setEdit({ brightness: 30 });

    svc.setActiveItem(id2);
    expect(svc.activeItemId()).toBe(id2);
    expect(svc.selectedFilter()).toBe('');
    expect(svc.selectedEdits().brightness).toBe(0);

    svc.setEdit({ contrast: 50 });

    // Switch back to item 1
    svc.setActiveItem(id1);
    expect(svc.selectedFilter()).toBe('grayscale(1)');
    expect(svc.selectedEdits().brightness).toBe(30);
    expect(svc.selectedEdits().contrast).toBe(0);
  });

  it('should remove item and update active item gracefully', () => {
    const id1 = svc.addImage({ src: 'blob:1', format: 'jpeg', origin: 'gallery' })!;
    const id2 = svc.addImage({ src: 'blob:2', format: 'jpeg', origin: 'gallery' })!;
    const id3 = svc.addImage({ src: 'blob:3', format: 'jpeg', origin: 'gallery' })!;

    svc.setActiveItem(id2);
    svc.removeItem(id2);

    expect(svc.mediaCount()).toBe(2);
    // Active item should now be id3 (or remaining at index 1)
    expect(svc.activeItemId()).toBe(id3);

    svc.removeItem(id3);
    expect(svc.activeItemId()).toBe(id1);

    svc.removeItem(id1);
    expect(svc.mediaCount()).toBe(0);
    expect(svc.activeItemId()).toBeNull();
  });

  it('should reorder items', () => {
    const id1 = svc.addImage({ src: 'blob:1', format: 'jpeg', origin: 'gallery' })!;
    const id2 = svc.addImage({ src: 'blob:2', format: 'jpeg', origin: 'gallery' })!;
    const id3 = svc.addImage({ src: 'blob:3', format: 'jpeg', origin: 'gallery' })!;

    svc.reorderItems([id3, id1, id2]);
    const items = svc.mediaItems();
    expect(items.map((i) => i.id)).toEqual([id3, id1, id2]);
  });

  it('should support new edit keys (saturation, warmth, vignette, sharpen)', () => {
    svc.addImage({ src: 'blob:1', format: 'jpeg', origin: 'gallery' });

    svc.setEdit({ saturation: 40, warmth: -20, vignette: 50, sharpen: 10 });
    const edits = svc.selectedEdits();
    expect(edits.saturation).toBe(40);
    expect(edits.warmth).toBe(-20);
    expect(edits.vignette).toBe(50);
    expect(edits.sharpen).toBe(10);

    expect(svc.effectiveFilter()).toContain('saturate(1.4)');
    expect(svc.effectiveFilter()).toContain('hue-rotate(4.0deg)');
  });

  it('should clamp new edit values properly', () => {
    svc.addImage({ src: 'blob:1', format: 'jpeg', origin: 'gallery' });

    svc.setEdit({ saturation: 200, warmth: -200, vignette: 150, sharpen: -50 });
    const edits = svc.selectedEdits();
    expect(edits.saturation).toBe(100);
    expect(edits.warmth).toBe(-100);
    expect(edits.vignette).toBe(100);
    expect(edits.sharpen).toBe(0);
  });

  it('should reset single image via selectImage (backward compat)', () => {
    svc.addImage({ src: 'blob:1', format: 'jpeg', origin: 'gallery' });
    svc.addImage({ src: 'blob:2', format: 'jpeg', origin: 'gallery' });
    expect(svc.mediaCount()).toBe(2);

    svc.selectImage({ src: 'blob:3', format: 'jpeg', origin: 'gallery' });
    expect(svc.mediaCount()).toBe(1);
    expect(svc.selectedImageSrc()).toBe('blob:3');
  });

  it('should reset item-specific pendingMediaId on edit change', () => {
    const id1 = svc.addImage({ src: 'blob:1', format: 'jpeg', origin: 'gallery' })!;
    svc.setPendingMediaId('pending-1');
    expect(svc.pendingMediaId()).toBe('pending-1');

    svc.setEdit({ brightness: 10 });
    expect(svc.pendingMediaId()).toBeNull();
  });
});
