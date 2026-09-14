import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PostCreationService } from '../../services/post-creation.service';
import { POST_FILTER_OPTIONS } from '../../data/posts.mock';
import { PhotoEditorComponent } from './photo-editor.component';

describe('PhotoEditorComponent', () => {
  let component: PhotoEditorComponent;
  let fixture: ComponentFixture<PhotoEditorComponent>;
  let postCreationService: PostCreationService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [PhotoEditorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PhotoEditorComponent);
    component = fixture.componentInstance;
    postCreationService = TestBed.inject(PostCreationService);
    postCreationService.selectImage({
      src: 'blob:image-src',
      format: 'jpeg',
      origin: 'gallery',
    });
    fixture.detectChanges();
  }));

  it('should create with the selected image', () => {
    expect(component).toBeTruthy();
    expect(postCreationService.hasSelectedImage()).toBeTrue();
  });

  it('should apply the selected filter', () => {
    const gingham = POST_FILTER_OPTIONS[1];
    component.selectFilter(gingham.filter);
    expect(postCreationService.selectedFilter()).toBe(gingham.filter);
    expect(component.isFilterActive(gingham.filter)).toBeTrue();
  });

  it('should switch between Filters, Adjust, and Rotate tabs', () => {
    component.setTab('adjust');
    expect(component.activeTab()).toBe('adjust');
    component.setTab('rotate');
    expect(component.activeTab()).toBe('rotate');
    component.setTab('filters');
    expect(component.activeTab()).toBe('filters');
  });

  it('should keep the reset slot reserved so the preview does not jump', () => {
    expect(
      fixture.nativeElement.querySelector('.photo-editor__reset-bar')
    ).not.toBeNull();
    expect(
      fixture.nativeElement.querySelector('.photo-editor__reset-btn')
    ).toBeNull();

    postCreationService.setFilter(POST_FILTER_OPTIONS[1].filter);
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelectorAll('.photo-editor__reset-bar').length
    ).toBe(1);
    expect(
      fixture.nativeElement.querySelector('.photo-editor__reset-btn')
    ).not.toBeNull();
  });

  it('should update edits through the adjust controls', () => {
    component.onAdjustChange('brightness', { detail: { value: 40 } } as CustomEvent);
    expect(postCreationService.selectedEdits().brightness).toBe(40);

    component.onAdjustChange('contrast', { detail: { value: -20 } } as CustomEvent);
    expect(postCreationService.selectedEdits().contrast).toBe(-20);

    component.onAdjustChange('blur', { detail: { value: 5 } } as CustomEvent);
    expect(postCreationService.selectedEdits().blur).toBe(5);
  });

  it('should rotate clockwise in 90 degree steps', () => {
    component.rotateClockwise();
    expect(postCreationService.selectedEdits().rotate).toBe(1);
    component.rotateClockwise();
    component.rotateClockwise();
    component.rotateClockwise();
    expect(postCreationService.selectedEdits().rotate).toBe(0);
  });

  it('should reset rotate without touching other edits', () => {
    postCreationService.setEdit({ brightness: 30 });
    component.rotateClockwise();
    component.resetRotate();
    expect(postCreationService.selectedEdits().rotate).toBe(0);
    expect(postCreationService.selectedEdits().brightness).toBe(30);
  });

  it('should reset all filters and edits', () => {
    postCreationService.setFilter(POST_FILTER_OPTIONS[1].filter);
    postCreationService.setEdit({ brightness: 30 });
    expect(component.hasNonNeutralVisuals()).toBeTrue();

    component.resetAll();

    expect(component.hasNonNeutralVisuals()).toBeFalse();
    expect(postCreationService.selectedFilter()).toBe('');
  });

  it('should emit done when closing the editor', () => {
    let doneCount = 0;
    const subscription = component.done.subscribe(() => doneCount++);

    component.closeEditor();

    expect(doneCount).toBe(1);
    subscription.unsubscribe();
  });
});