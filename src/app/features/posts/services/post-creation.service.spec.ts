import { PostCreationService } from './post-creation.service';

describe('PostCreationService - PostEditState + Effective signals', () => {
  let svc: PostCreationService;

  beforeEach(() => {
    svc = new PostCreationService();
    svc.selectImage({ src: 'blob:a', format: 'jpeg', origin: 'gallery' });
    // reset to neutral after selectImage already does
  });

  it('should have neutral effective signals initially', () => {
    expect(svc.effectiveFilter()).toBe('');
    expect(svc.effectiveTransform()).toBe('');
    expect(svc.pendingMediaId()).toBeNull();
  });

  it('should reset filter and edits on selectImage', () => {
    svc.setFilter('grayscale(1)');
    svc.setEdit({ brightness: 50 });
    svc.setPendingMediaId('media-1');
    svc.selectImage({ src: 'blob:b', format: 'jpeg', origin: 'gallery' });
    expect(svc.selectedFilter()).toBe('');
    expect(svc.selectedEdits()).toEqual({ brightness: 0, contrast: 0, blur: 0, rotate: 0 });
    expect(svc.pendingMediaId()).toBeNull();
    expect(svc.effectiveFilter()).toBe('');
  });

  it('should keep Filter excluyente', () => {
    svc.setFilter('grayscale(1)');
    expect(svc.effectiveFilter()).toBe('grayscale(1)');
    svc.setFilter('sepia(1)');
    expect(svc.selectedFilter()).toBe('sepia(1)');
    expect(svc.effectiveFilter()).toBe('sepia(1)');
  });

  it('should compose Edits additively on top of Filter in deterministic order', () => {
    svc.setFilter('sepia(1)');
    svc.setEdit({ brightness: 50 });
    expect(svc.effectiveFilter()).toBe('sepia(1) brightness(1.5)');
    svc.setEdit({ contrast: -20 });
    expect(svc.effectiveFilter()).toBe('sepia(1) brightness(1.5) contrast(0.8)');
    svc.setEdit({ blur: 5 });
    expect(svc.effectiveFilter()).toBe('sepia(1) brightness(1.5) contrast(0.8) blur(5px)');
    // neutral values do not contribute
    svc.setEdit({ brightness: 0 });
    expect(svc.effectiveFilter()).toBe('sepia(1) contrast(0.8) blur(5px)');
  });

  it('should expose Effective Transform for rotate', () => {
    expect(svc.effectiveTransform()).toBe('');
    svc.setEdit({ rotate: 1 });
    expect(svc.effectiveTransform()).toBe('rotate(90deg)');
    svc.setEdit({ rotate: 2 });
    expect(svc.effectiveTransform()).toBe('rotate(180deg)');
    svc.updateEdit('rotate', 3);
    expect(svc.effectiveTransform()).toBe('rotate(270deg)');
    svc.updateEdit('rotate', 0);
    expect(svc.effectiveTransform()).toBe('');
  });

  it('should invalidate pendingMediaId on visual change', () => {
    svc.setPendingMediaId('media-2');
    svc.setFilter('grayscale(1)');
    expect(svc.pendingMediaId()).toBeNull();

    svc.setPendingMediaId('media-3');
    svc.setEdit({ brightness: 10 });
    expect(svc.pendingMediaId()).toBeNull();

    svc.setPendingMediaId('media-4');
    svc.resetEdit('brightness');
    expect(svc.pendingMediaId()).toBeNull();

    // same value does not invalidate
    svc.setPendingMediaId('media-5');
    const currentBrightness = svc.selectedEdits().brightness;
    svc.setEdit({ brightness: currentBrightness });
    expect(svc.pendingMediaId()).toBe('media-5');

    // same filter does not invalidate
    const currentFilter = svc.selectedFilter();
    svc.setPendingMediaId('media-6');
    svc.setFilter(currentFilter);
    expect(svc.pendingMediaId()).toBe('media-6');
  });

  it('should resetEdit partially', () => {
    svc.setEdit({ brightness: 20, contrast: 30 });
    svc.resetEdit('brightness');
    expect(svc.selectedEdits().brightness).toBe(0);
    expect(svc.selectedEdits().contrast).toBe(30);
  });

  it('should resetAll clears filter+edits but keeps image', () => {
    svc.setFilter('grayscale(1)');
    svc.setEdit({ blur: 2, rotate: 1 });
    svc.setPendingMediaId('media-6');
    const srcBefore = svc.selectedImageSrc();
    svc.resetAll();
    expect(svc.selectedFilter()).toBe('');
    expect(svc.selectedEdits()).toEqual({ brightness: 0, contrast: 0, blur: 0, rotate: 0 });
    expect(svc.pendingMediaId()).toBeNull();
    expect(svc.selectedImageSrc()).toBe(srcBefore);
    expect(svc.effectiveFilter()).toBe('');
    expect(svc.effectiveTransform()).toBe('');
  });

  it('should reset clears image', () => {
    svc.setFilter('grayscale(1)');
    svc.reset();
    expect(svc.hasSelectedImage()).toBeFalse();
    expect(svc.selectedFilter()).toBe('');
    expect(svc.pendingMediaId()).toBeNull();
    expect(svc.selectedEdits()).toEqual({ brightness: 0, contrast: 0, blur: 0, rotate: 0 });
  });

  it('should clamp values', () => {
    svc.setEdit({ brightness: 200 });
    expect(svc.selectedEdits().brightness).toBe(100);
    svc.setEdit({ brightness: -200 });
    expect(svc.selectedEdits().brightness).toBe(-100);
    svc.setEdit({ blur: 99 });
    expect(svc.selectedEdits().blur).toBe(10);
    svc.setEdit({ blur: -5 });
    expect(svc.selectedEdits().blur).toBe(0);
    svc.setEdit({ rotate: 5 });
    expect(svc.selectedEdits().rotate).toBe(1);
    svc.setEdit({ rotate: -1 });
    expect(svc.selectedEdits().rotate).toBe(3);
  });
});
