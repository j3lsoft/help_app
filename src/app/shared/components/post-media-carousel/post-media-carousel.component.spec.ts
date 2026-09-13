import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PostMediaCarouselComponent } from './post-media-carousel.component';

describe('PostMediaCarouselComponent', () => {
  let component: PostMediaCarouselComponent;
  let fixture: ComponentFixture<PostMediaCarouselComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [PostMediaCarouselComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PostMediaCarouselComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    fixture.componentRef.setInput('images', ['a.png']);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render a single image without dots', () => {
    fixture.componentRef.setInput('images', ['a.png']);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelectorAll('.carousel__single-image').length).toBe(1);
    expect(host.querySelector('.carousel__dots')).toBeNull();
  });

  it('should render N images with N dots for carousels', () => {
    fixture.componentRef.setInput('images', ['a.png', 'b.png', 'c.png']);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelectorAll('.carousel__image').length).toBe(3);
    expect(host.querySelectorAll('.carousel__dot').length).toBe(3);
  });

  it('should render nothing when empty (text-only)', () => {
    fixture.componentRef.setInput('images', []);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('.carousel')).toBeNull();
    expect(host.querySelector('.carousel__single-image')).toBeNull();
  });

  it('should activate the tapped dot slide and clamp out-of-range indexes', () => {
    fixture.componentRef.setInput('images', ['a.png', 'b.png', 'c.png']);
    fixture.detectChanges();

    component.goToSlide(2);
    expect(component.activeIndex()).toBe(2);

    component.goToSlide(99);
    expect(component.activeIndex()).toBe(2);

    component.goToSlide(-5);
    expect(component.activeIndex()).toBe(0);
  });

  it('should mark the active dot with aria-selected', () => {
    fixture.componentRef.setInput('images', ['a.png', 'b.png']);
    fixture.detectChanges();

    component.goToSlide(1);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const dots = host.querySelectorAll('.carousel__dot');
    expect(dots[1].getAttribute('aria-selected')).toBe('true');
    expect(dots[0].getAttribute('aria-selected')).toBe('false');
  });

  it('should emit imageTap with the tapped image index', () => {
    fixture.componentRef.setInput('images', ['a.png', 'b.png']);
    fixture.detectChanges();

    let tapped: number | undefined;
    component.imageTap.subscribe((index) => (tapped = index));

    component.onImageClick(1);

    expect(tapped).toBe(1);
  });

  it('should not emit imageTap when the gesture was a drag', () => {
    fixture.componentRef.setInput('images', ['a.png', 'b.png']);
    fixture.detectChanges();

    let tapped: number | undefined;
    component.imageTap.subscribe((index) => (tapped = index));

    component.onPointerDown({ clientX: 100 } as PointerEvent);
    component.onPointerMove({ clientX: 160 } as PointerEvent);
    component.onPointerUp();
    component.onImageClick(1);

    expect(tapped).toBeUndefined();
  });
});
