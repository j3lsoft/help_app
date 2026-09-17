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
    expect(host.querySelector('.expandable-text__more')).toBeNull();
  });

  it('should preserve author line breaks', () => {
    fixture.componentRef.setInput('text', 'first line\nsecond line');
    fixture.detectChanges();

    const content = (fixture.nativeElement as HTMLElement).querySelector(
      '.expandable-text__content'
    ) as HTMLElement;
    expect(getComputedStyle(content).whiteSpace).toBe('pre-wrap');
  });

  it('should truncate long text with "Show more" marker', () => {
    fixture.componentRef.setInput('text', LONG_TEXT);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const more = host.querySelector('.expandable-text__more');
    expect(more?.textContent).toContain('Show more');
    expect(host.querySelector('.expandable-text__marker')).not.toBeNull();
    expect(host.textContent?.length ?? 0).toBeLessThan(LONG_TEXT.length);
  });

  it('should expand on click and remove the toggle (one-way)', () => {
    fixture.componentRef.setInput('text', LONG_TEXT);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    (host.querySelector('.expandable-text__more') as HTMLElement).click();
    fixture.detectChanges();

    expect(fixture.componentInstance.expanded()).toBeTrue();
    expect(host.querySelector('.expandable-text__more')).toBeNull();
    expect(host.querySelector('.expandable-text__marker')).toBeNull();
    expect(host.textContent).toContain(LONG_TEXT.slice(-20).trim().slice(0, 10));
  });

  it('should move focus to the text when expanded', () => {
    fixture.componentRef.setInput('text', LONG_TEXT);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    (host.querySelector('.expandable-text__more') as HTMLElement).click();
    fixture.detectChanges();

    const content = host.querySelector('.expandable-text__content') as HTMLElement;
    expect(document.activeElement).toBe(content);
  });

  it('should reset to collapsed when the input changes', () => {
    fixture.componentRef.setInput('text', LONG_TEXT);
    fixture.detectChanges();
    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLElement>('.expandable-text__more')
      ?.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.expanded()).toBeTrue();

    fixture.componentRef.setInput('text', `${LONG_TEXT} extra`);
    fixture.detectChanges();
    expect(fixture.componentInstance.expanded()).toBeFalse();
  });
});
