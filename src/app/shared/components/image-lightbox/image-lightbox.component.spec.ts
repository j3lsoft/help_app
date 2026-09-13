import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ImageLightboxComponent } from './image-lightbox.component';

describe('ImageLightboxComponent', () => {
  let component: ImageLightboxComponent;
  let fixture: ComponentFixture<ImageLightboxComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ImageLightboxComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ImageLightboxComponent);
    component = fixture.componentInstance;
  }));

  it('should render one slide per image', () => {
    fixture.componentRef.setInput('images', ['a.png', 'b.png']);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelectorAll('swiper-slide').length).toBe(2);
  });

  it('should wrap each image in a zoom container', () => {
    fixture.componentRef.setInput('images', ['a.png', 'b.png']);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const containers = host.querySelectorAll('.swiper-zoom-container');
    expect(containers.length).toBe(2);
    containers.forEach((container) => {
      expect(container.querySelector('img')).not.toBeNull();
    });
  });

  it('should enable gesture zoom on the swiper', () => {
    fixture.componentRef.setInput('images', ['a.png']);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const swiper = host.querySelector('swiper-container') as
      | (HTMLElement & { zoom?: unknown })
      | null;
    const zoomEnabled =
      swiper?.zoom === true || swiper?.getAttribute('zoom') === 'true';
    expect(zoomEnabled).toBeTrue();
  });

  it('should start on the requested image', () => {
    fixture.componentRef.setInput('images', ['a.png', 'b.png', 'c.png']);
    fixture.componentRef.setInput('startIndex', 2);
    fixture.detectChanges();

    expect(component.activeIndex()).toBe(2);
  });

  it('should track the active slide reported by swiper', () => {
    fixture.componentRef.setInput('images', ['a.png', 'b.png', 'c.png']);
    fixture.detectChanges();

    component.onSlideChange({
      target: { swiper: { activeIndex: 1 } },
    } as unknown as Event);

    expect(component.activeIndex()).toBe(1);
  });

  it('should request closing', () => {
    fixture.componentRef.setInput('images', ['a.png']);
    fixture.detectChanges();

    expect(component.isOpen()).toBeTrue();
    component.close();
    expect(component.isOpen()).toBeFalse();
  });
});
