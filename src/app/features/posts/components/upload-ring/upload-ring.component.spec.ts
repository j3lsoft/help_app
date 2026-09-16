import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UploadRingComponent } from './upload-ring.component';

describe('UploadRingComponent', () => {
  let fixture: ComponentFixture<UploadRingComponent>;
  let component: UploadRingComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadRingComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(UploadRingComponent);
    component = fixture.componentInstance;
  });

  it('should create with default 0% uploading', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.clamped()).toBe(0);
    const el: HTMLElement = fixture.nativeElement.querySelector('.upload-ring');
    expect(el.getAttribute('role')).toBe('progressbar');
    expect(el.getAttribute('aria-valuenow')).toBe('0');
  });

  it('should clamp progress to 0..100', () => {
    fixture.componentRef.setInput('progress', 142);
    fixture.detectChanges();
    expect(component.clamped()).toBe(100);
    fixture.componentRef.setInput('progress', -8);
    fixture.detectChanges();
    expect(component.clamped()).toBe(0);
  });

  it('should draw an arc proportional to progress', () => {
    fixture.componentRef.setInput('progress', 25);
    fixture.detectChanges();

    const bar: SVGElement = fixture.nativeElement.querySelector(
      '.upload-ring__bar'
    );
    expect(bar.getAttribute('pathLength')).toBe('100');
    expect(bar.getAttribute('stroke-dasharray')).toBe('100');
    expect(Number(bar.getAttribute('stroke-dashoffset'))).toBeCloseTo(75, 4);

    fixture.componentRef.setInput('progress', 0);
    fixture.detectChanges();
    expect(Number(bar.getAttribute('stroke-dashoffset'))).toBeCloseTo(100, 4);

    fixture.componentRef.setInput('progress', 100);
    fixture.detectChanges();
    expect(Number(bar.getAttribute('stroke-dashoffset'))).toBeCloseTo(0, 4);
  });

  it('should show check on done and announce completion', () => {
    fixture.componentRef.setInput('status', 'done');
    fixture.componentRef.setInput('progress', 100);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement.querySelector('.upload-ring');
    expect(el.getAttribute('aria-valuetext')).toContain('complete');
    expect(fixture.nativeElement.querySelector('.upload-ring__check')).toBeTruthy();
  });

  it('should show percent while uploading', () => {
    fixture.componentRef.setInput('status', 'uploading');
    fixture.componentRef.setInput('progress', 42);
    fixture.detectChanges();
    const pct: HTMLElement = fixture.nativeElement.querySelector('.upload-ring__pct');
    expect(pct?.textContent).toContain('42');
  });
});
