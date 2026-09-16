import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ProfileMediaItem } from '../../models/profile-media-item.model';
import { ProfileMediaGridComponent } from './profile-media-grid.component';

const MEDIA: ProfileMediaItem[] = [
  { key: 'p1#0', image: 'a.png', postId: 'p1' },
  { key: 'p1#1', image: 'b.png', postId: 'p1' },
  { key: 'p2#0', image: 'c.png', postId: 'p2' },
];

describe('ProfileMediaGridComponent', () => {
  let component: ProfileMediaGridComponent;
  let fixture: ComponentFixture<ProfileMediaGridComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ProfileMediaGridComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileMediaGridComponent);
    component = fixture.componentInstance;
  }));

  it('should render one cell per media item', () => {
    fixture.componentRef.setInput('media', MEDIA);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelectorAll('.profile-media-grid__image').length).toBe(3);
  });

  it('should emit the flattened index when tapping a media item', () => {
    fixture.componentRef.setInput('media', MEDIA);
    fixture.detectChanges();

    let emitted: number | undefined;
    component.mediaClick.subscribe((index) => (emitted = index));

    const second = (fixture.nativeElement as HTMLElement).querySelectorAll(
      '.profile-media-grid__image',
    )[1] as HTMLElement;
    second.click();

    expect(emitted).toBe(1);
  });
});
