import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
  waitForAsync,
} from '@angular/core/testing';
import {
  MediaItem,
  POST_EDIT_STATE_NEUTRAL,
} from '../../models/post-creation.model';
import { MediaGridComponent } from './media-grid.component';

function makeItems(count: number): MediaItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `item-${i + 1}`,
    image: { src: `blob:image-${i}`, format: 'jpeg', origin: 'gallery' },
    filter: 'none',
    edits: { ...POST_EDIT_STATE_NEUTRAL },
    pendingMediaId: null,
  }));
}

function pointerEvent(init: Record<string, unknown>): PointerEvent {
  return {
    preventDefault: () => undefined,
    clientX: 0,
    clientY: 0,
    pointerId: 1,
    pointerType: 'touch',
    currentTarget: null,
    target: null,
    ...init,
  } as unknown as PointerEvent;
}

function cellElement(index: number): HTMLElement {
  const cell = document.createElement('div');
  cell.className = 'media-grid__cell';
  cell.dataset['index'] = String(index);
  return cell;
}

describe('MediaGridComponent', () => {
  let component: MediaGridComponent;
  let fixture: ComponentFixture<MediaGridComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MediaGridComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MediaGridComponent);
    component = fixture.componentInstance;
  }));

  function render(items: MediaItem[]): void {
    fixture.componentRef.setInput('items', items);
    fixture.detectChanges();
  }

  function startTouchHold(index = 0): HTMLElement {
    const cell = cellElement(index);
    component.onPointerDown(
      index,
      pointerEvent({ clientX: 0, clientY: 0, currentTarget: cell, target: cell })
    );
    return cell;
  }

  it('should create', () => {
    render([]);
    expect(component).toBeTruthy();
  });

  it('should map item count to the grid layout class', () => {
    render(makeItems(1));
    expect(component.gridClass).toBe('media-grid--1');

    render(makeItems(3));
    expect(component.gridClass).toBe('media-grid--3');

    render(makeItems(5));
    expect(component.gridClass).toBe('media-grid--5');
  });

  it('should clamp the layout class for 0 and more than 5 items', () => {
    render([]);
    expect(component.gridClass).toBe('media-grid--1');

    render(makeItems(7));
    expect(component.gridClass).toBe('media-grid--5');
  });

  it('should not render a drag handle, hint, numbering or arrows', () => {
    render(makeItems(3));

    expect(
      fixture.nativeElement.querySelector('.media-grid__drag-handle')
    ).toBeNull();
    expect(fixture.nativeElement.querySelector('.media-grid__hint')).toBeNull();
    expect(
      fixture.nativeElement.querySelectorAll('.media-grid__order-badge').length
    ).toBe(0);
    expect(
      fixture.nativeElement.querySelectorAll('.media-grid__reorder-actions')
        .length
    ).toBe(0);
  });

  it('should render draggable cells carrying their index', () => {
    render(makeItems(3));

    const cells = fixture.nativeElement.querySelectorAll('.media-grid__cell');
    expect(cells.length).toBe(3);
    expect(cells[0].getAttribute('data-index')).toBe('0');
    expect(cells[2].getAttribute('data-index')).toBe('2');
    expect(cells[0].getAttribute('draggable')).toBe('true');
  });

  it('should compute the image filter from the edits', () => {
    const [item] = makeItems(1);
    expect(component.getItemFilter(item)).toBe('none');

    item.edits.brightness = 100;
    expect(component.getItemFilter(item)).toContain('brightness(2)');

    item.edits.blur = 4;
    expect(component.getItemFilter(item)).toContain('blur(4px)');
  });

  it('should compute the image transform from rotation', () => {
    const [item] = makeItems(1);
    expect(component.getItemTransform(item)).toBe('');

    item.edits.rotate = 1;
    expect(component.getItemTransform(item)).toBe('rotate(90deg)');
  });

  it('should emit edit when a cell is clicked', () => {
    const items = makeItems(2);
    render(items);
    const editSpy = jasmine.createSpy('edit');
    component.edit.subscribe(editSpy);

    component.onCellClick(items[0], {
      stopPropagation: () => undefined,
    } as MouseEvent);

    expect(editSpy).toHaveBeenCalledWith(items[0].id);
  });

  it('should emit remove when the remove button is clicked', () => {
    const items = makeItems(2);
    render(items);
    const removeSpy = jasmine.createSpy('remove');
    component.remove.subscribe(removeSpy);

    component.onRemoveClick(items[1], {
      stopPropagation: () => undefined,
    } as MouseEvent);

    expect(removeSpy).toHaveBeenCalledWith(items[1].id);
  });

  it('should emit reordered ids on HTML5 drop', () => {
    const items = makeItems(3);
    render(items);
    const reorderSpy = jasmine.createSpy('reorder');
    component.reorder.subscribe(reorderSpy);

    component.onDragStart(0, {
      target: document.createElement('div'),
      preventDefault: () => undefined,
      dataTransfer: { effectAllowed: '', setData: () => undefined },
    } as unknown as DragEvent);
    component.onDrop(2, {
      preventDefault: () => undefined,
    } as unknown as DragEvent);

    expect(reorderSpy).toHaveBeenCalledWith([
      items[1].id,
      items[2].id,
      items[0].id,
    ]);
  });

  it('should ignore a native drag started from an interactive control', () => {
    const items = makeItems(3);
    render(items);
    const preventDefault = jasmine.createSpy('preventDefault');

    component.onDragStart(0, {
      target: document.createElement('button'),
      preventDefault,
      dataTransfer: { effectAllowed: '', setData: () => undefined },
    } as unknown as DragEvent);

    expect(preventDefault).toHaveBeenCalled();
    expect(component.draggedIndex()).toBeNull();
  });

  it('should ignore long-press on a mouse (desktop uses native drag)', fakeAsync(() => {
    render(makeItems(3));

    const cell = cellElement(0);
    component.onPointerDown(
      0,
      pointerEvent({ pointerType: 'mouse', currentTarget: cell, target: cell })
    );
    tick(400);

    expect(component.dragPreview()).toBeNull();
    expect(component.draggedIndex()).toBeNull();
  }));

  it('should lift a preview after holding the tile still', fakeAsync(() => {
    const items = makeItems(3);
    render(items);

    startTouchHold(0);
    expect(component.dragPreview()).toBeNull();

    tick(320);

    const preview = component.dragPreview();
    expect(preview).not.toBeNull();
    expect(preview?.src).toBe(items[0].image.src);
    expect(preview?.settling).toBeFalse();
    expect(component.draggedIndex()).toBe(0);
  }));

  it('should treat movement during the hold as a scroll, not a drag', fakeAsync(() => {
    render(makeItems(3));

    startTouchHold(0);
    component.onPointerMove(pointerEvent({ clientX: 40, clientY: 0 }));
    tick(400);

    expect(component.dragPreview()).toBeNull();
    expect(component.draggedIndex()).toBeNull();
  }));

  it('should not hit-test before the tile is grabbed', fakeAsync(() => {
    render(makeItems(3));
    const elementFromPoint = spyOn(document, 'elementFromPoint');

    startTouchHold(0);
    component.onPointerMove(pointerEvent({ clientX: 2, clientY: 2 }));

    expect(elementFromPoint).not.toHaveBeenCalled();

    tick(320);
    expect(elementFromPoint).not.toHaveBeenCalled();
  }));

  it('should reorder on release after a long-press drag', fakeAsync(() => {
    const items = makeItems(3);
    render(items);
    const reorderSpy = jasmine.createSpy('reorder');
    component.reorder.subscribe(reorderSpy);
    spyOn(document, 'elementFromPoint').and.returnValue(cellElement(2));

    const cell = startTouchHold(0);
    tick(320);
    expect(component.dragOverIndex()).toBeNull();

    component.onPointerMove(pointerEvent({ clientX: 40, clientY: 0 }));
    expect(component.dragOverIndex()).toBe(2);

    component.onPointerUp(
      pointerEvent({ clientX: 40, clientY: 0, currentTarget: cell })
    );

    expect(reorderSpy).toHaveBeenCalledWith([
      items[1].id,
      items[2].id,
      items[0].id,
    ]);
    expect(component.draggedIndex()).toBeNull();
    expect(component.dragOverIndex()).toBeNull();
    expect(component.dragPreview()?.settling).toBeTrue();

    tick(250);
    expect(component.dragPreview()).toBeNull();
  }));

  it('should suppress the edit tap that follows a long-press drag', fakeAsync(() => {
    const items = makeItems(3);
    render(items);
    const editSpy = jasmine.createSpy('edit');
    component.edit.subscribe(editSpy);

    startTouchHold(0);
    tick(320);
    component.onPointerUp(pointerEvent({}));

    component.onCellClick(items[0], {
      stopPropagation: () => undefined,
    } as MouseEvent);

    expect(editSpy).not.toHaveBeenCalled();

    tick(250);
  }));

  it('should drop the lifted preview on pointer cancel', fakeAsync(() => {
    render(makeItems(3));

    startTouchHold(0);
    tick(320);
    expect(component.dragPreview()).not.toBeNull();

    component.onPointerCancel(pointerEvent({}));

    expect(component.dragPreview()).toBeNull();
    expect(component.draggedIndex()).toBeNull();
  }));
});
