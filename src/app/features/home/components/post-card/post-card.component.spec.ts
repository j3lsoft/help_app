import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Post, PostCardComponent } from './post-card.component';

const SINGLE: Post = {
  id: 'p1',
  userProfilePic: 'avatar.png',
  userName: 'Alicia',
  userDetail: '',
  aboutPost: 'hello',
  postLikes: '10k',
  postComments: '100',
  postShares: '35',
  postImage: 'a.png',
  postImages: ['a.png'],
  postLike: false,
};

const CAROUSEL: Post = {
  ...SINGLE,
  id: 'p2',
  postImages: ['a.png', 'b.png', 'c.png'],
};

const TEXT_ONLY: Post = { ...SINGLE, id: 'p3', postImage: '', postImages: [] };

describe('PostCardComponent', () => {
  let component: PostCardComponent;
  let fixture: ComponentFixture<PostCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [PostCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PostCardComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    fixture.componentRef.setInput('post', SINGLE);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render a single image without dots', () => {
    fixture.componentRef.setInput('post', SINGLE);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelectorAll('.carousel__single-image').length).toBe(1);
    expect(host.querySelector('.carousel__dots')).toBeNull();
  });

  it('should render a carousel with dots for multiple images', () => {
    fixture.componentRef.setInput('post', CAROUSEL);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelectorAll('.carousel__image').length).toBe(3);
    expect(host.querySelectorAll('.carousel__dot').length).toBe(3);
  });

  it('should render no media for text-only posts', () => {
    fixture.componentRef.setInput('post', TEXT_ONLY);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('app-post-media-carousel')).toBeNull();
  });

  it('should emit the post id when tapping the media', () => {
    fixture.componentRef.setInput('post', SINGLE);
    fixture.detectChanges();

    let emitted: string | undefined;
    component.postClick.subscribe((id) => (emitted = id));

    const media = (fixture.nativeElement as HTMLElement).querySelector(
      '.post-card__media'
    ) as HTMLElement;
    media.click();

    expect(emitted).toBe('p1');
  });
});
