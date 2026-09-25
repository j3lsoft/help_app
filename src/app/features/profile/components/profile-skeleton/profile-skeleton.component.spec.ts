import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileSkeletonComponent } from './profile-skeleton.component';

describe('ProfileSkeletonComponent', () => {
  let fixture: ComponentFixture<ProfileSkeletonComponent>;

  function render(inputs: {
    region: 'header' | 'content';
    tab?: 'posts' | 'media';
    actions?: 'single' | 'double';
  }): HTMLElement {
    fixture = TestBed.createComponent(ProfileSkeletonComponent);
    fixture.componentRef.setInput('region', inputs.region);
    if (inputs.tab) {
      fixture.componentRef.setInput('tab', inputs.tab);
    }
    if (inputs.actions) {
      fixture.componentRef.setInput('actions', inputs.actions);
    }
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileSkeletonComponent],
    }).compileComponents();
  });

  it('announces the header region as a busy status', () => {
    const el = render({ region: 'header', actions: 'single' });

    const status = el.querySelector('[role="status"]');
    expect(status).toBeTruthy();
    expect(status?.getAttribute('aria-busy')).toBe('true');
    expect(status?.getAttribute('aria-label')).toBe('Loading profile');
    expect(el.querySelectorAll('.profile-skeleton__stat').length).toBe(3);
    expect(el.querySelectorAll('.profile-skeleton__action-single').length).toBe(
      1,
    );
  });

  it('reserves two action buttons for the double variant', () => {
    const el = render({ region: 'header', actions: 'double' });

    expect(el.querySelectorAll('.profile-skeleton__action').length).toBe(2);
  });

  it('mirrors the posts list by default', () => {
    const el = render({ region: 'content' });

    const status = el.querySelector('[role="status"]');
    expect(status?.getAttribute('aria-label')).toBe('Loading posts');
    expect(el.querySelectorAll('.profile-skeleton__post').length).toBe(2);
    expect(el.querySelectorAll('.profile-skeleton__media').length).toBe(1);
  });

  it('mirrors the media grid when the media tab is active', () => {
    const el = render({ region: 'content', tab: 'media' });

    const status = el.querySelector('[role="status"]');
    expect(status?.getAttribute('aria-label')).toBe('Loading media');
    expect(el.querySelectorAll('.profile-skeleton__grid-item').length).toBe(6);
    expect(el.querySelectorAll('.profile-skeleton__post').length).toBe(0);
  });
});
