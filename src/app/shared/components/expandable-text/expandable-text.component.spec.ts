import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ExpandableTextComponent } from './expandable-text.component';

const LONG_TEXT =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
  'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. '.repeat(6);

describe('ExpandableTextComponent', () => {
  let fixture: ComponentFixture<ExpandableTextComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ExpandableTextComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpandableTextComponent);
  }));

  it('should create', () => {
    fixture.componentRef.setInput('text', 'Hi');
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render short text without toggle', () => {
    fixture.componentRef.setInput('text', 'Hello world');
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent).toContain('Hello world');
    expect(host.querySelector('.expandable-text__toggle')).toBeNull();
  });

  it('should collapse long text with "Show more" marker', () => {
    fixture.componentRef.setInput('text', LONG_TEXT);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const toggle = host.querySelector('.expandable-text__toggle');
    expect(toggle?.textContent).toContain('Show more');
    expect(host.querySelector('.expandable-text__marker')).not.toBeNull();
    expect(host.textContent?.length ?? 0).toBeLessThan(LONG_TEXT.length);
  });

  it('should expand and collapse on toggle', () => {
    fixture.componentRef.setInput('text', LONG_TEXT);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    (host.querySelector('.expandable-text__toggle') as HTMLElement).click();
    fixture.detectChanges();

    expect(host.textContent).toContain('Show less');
    expect(host.textContent).toContain(LONG_TEXT.slice(-20).trim().slice(0, 10));

    (host.querySelector('.expandable-text__toggle') as HTMLElement).click();
    fixture.detectChanges();

    expect(host.textContent).toContain('Show more');
  });

  it('should reset to collapsed when the input changes', () => {
    fixture.componentRef.setInput('text', LONG_TEXT);
    fixture.detectChanges();
    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLElement>('.expandable-text__toggle')
      ?.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.expanded()).toBeTrue();

    fixture.componentRef.setInput('text', `${LONG_TEXT} extra`);
    fixture.detectChanges();
    expect(fixture.componentInstance.expanded()).toBeFalse();
  });
});
