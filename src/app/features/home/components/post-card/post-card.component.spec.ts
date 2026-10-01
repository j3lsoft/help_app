import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Post } from '@features/posts/models/post-view.model';
import { PostCardComponent } from './post-card.component';

const SINGLE: Post = {
  id: 'p1',
  userProfilePic: 'avatar.png',
  userName: 'Alicia',
  username: 'alicia',
  createdAt: '2026-09-01T00:00:00Z',
  aboutPost: 'hello',
  postLikes: '10k',
  postComments: '100',
  postSaves: '35',
  postSaved: false,
  postImages: ['a.png'],
  postLike: false,
};

const CAROUSEL: Post = {
  ...SINGLE,
  id: 'p2',
  postImages: ['a.png', 'b.png', 'c.png'],
};

const TEXT_ONLY: Post = { ...SINGLE, id: 'p3', postImages: [] };

const TRUNCATED: Post = { ...SINGLE, id: 'p4', aboutPost: 'word '.repeat(80) };

const TEXTLESS: Post = {
  ...SINGLE,
  id: 'p5',
  aboutPost: '',
  postImages: [],
};

const TEXTLESS_IMAGE: Post = {
  ...SINGLE,
  id: 'p6',
  aboutPost: '',
};

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

  it('should emit the tapped image index, not open the Lightbox, on an image tap', () => {
    fixture.componentRef.setInput('post', CAROUSEL);
    fixture.detectChanges();

    let activation: { postId: string; imageIndex: number } | undefined;
    let postEmitted = false;
    component.mediaClick.subscribe((value) => (activation = value));
    component.postClick.subscribe(() => (postEmitted = true));

    const images = (fixture.nativeElement as HTMLElement).querySelectorAll(
      '.carousel__image'
    );
    (images[1] as HTMLElement).click();
    fixture.detectChanges();

    expect(activation).toEqual({ postId: 'p2', imageIndex: 1 });
    expect(postEmitted).toBeFalse();
    expect(component.viewerOpen()).toBeFalse();
  });

  it('should open the Lightbox from the media expand button', () => {
    fixture.componentRef.setInput('post', SINGLE);
    fixture.detectChanges();

    let postEmitted = false;
    component.postClick.subscribe(() => (postEmitted = true));

    (fixture.nativeElement as HTMLElement)
      .querySelector('.post-card__media-expand')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(component.viewerOpen()).toBeTrue();
    expect(component.viewerIndex()).toBe(0);
    expect(postEmitted).toBeFalse();
  });

  it('should close the Lightbox', () => {
    fixture.componentRef.setInput('post', SINGLE);
    fixture.detectChanges();

    component.openViewer(0);
    fixture.detectChanges();
    expect(component.viewerOpen()).toBeTrue();

    component.closeViewer();
    fixture.detectChanges();
    expect(component.viewerOpen()).toBeFalse();
  });

  it('should mount the Lightbox outside the card so modal clicks cannot navigate', () => {
    fixture.componentRef.setInput('post', SINGLE);
    fixture.detectChanges();

    component.openViewer(0);
    fixture.detectChanges();

    const lightbox = (fixture.nativeElement as HTMLElement).querySelector(
      'app-image-lightbox'
    );
    expect(lightbox).not.toBeNull();
    expect(lightbox?.closest('article')).toBeNull();
  });

  it('should not open the Lightbox for a text-only post', () => {
    fixture.componentRef.setInput('post', TEXT_ONLY);
    fixture.detectChanges();

    component.openViewer(0);

    expect(component.viewerOpen()).toBeFalse();
  });

  it('should emit the post id when tapping anywhere on the card', () => {
    fixture.componentRef.setInput('post', SINGLE);
    fixture.detectChanges();

    let emitted: string | undefined;
    component.postClick.subscribe((id) => (emitted = id));

    const card = (fixture.nativeElement as HTMLElement).querySelector(
      '.post-card'
    ) as HTMLElement;
    card.click();

    expect(emitted).toBe('p1');
  });

  it('should emit the post id on keyboard activation', () => {
    fixture.componentRef.setInput('post', SINGLE);
    fixture.detectChanges();

    let emitted: string | undefined;
    component.postClick.subscribe((id) => (emitted = id));

    const card = (fixture.nativeElement as HTMLElement).querySelector(
      '.post-card'
    ) as HTMLElement;
    card.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

    expect(emitted).toBe('p1');
  });

  it('should not open the post when tapping the author', () => {
    fixture.componentRef.setInput('post', SINGLE);
    fixture.detectChanges();

    let postEmitted = false;
    let followedUser: string | undefined;
    component.postClick.subscribe(() => (postEmitted = true));
    component.userClick.subscribe((name) => (followedUser = name));

    (fixture.nativeElement as HTMLElement)
      .querySelector('.post-card__author')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(followedUser).toBe('Alicia');
    expect(postEmitted).toBeFalse();
  });

  it('should not open the post when tapping an action', () => {
    fixture.componentRef.setInput('post', SINGLE);
    fixture.detectChanges();

    let postEmitted = false;
    let liked = false;
    component.postClick.subscribe(() => (postEmitted = true));
    component.likeClick.subscribe(() => (liked = true));

    const like = (fixture.nativeElement as HTMLElement).querySelectorAll(
      '.post-card__action'
    )[0] as HTMLElement;
    like.click();

    expect(liked).toBeTrue();
    expect(postEmitted).toBeFalse();
  });

  it('should not open the post when expanding the truncated text', () => {
    fixture.componentRef.setInput('post', TRUNCATED);
    fixture.detectChanges();

    let postEmitted = false;
    component.postClick.subscribe(() => (postEmitted = true));

    const more = (fixture.nativeElement as HTMLElement).querySelector(
      '.expandable-text__more'
    ) as HTMLElement;
    expect(more).not.toBeNull();
    more.click();

    expect(postEmitted).toBeFalse();
  });

  it('should render the username and date inline after the author name', () => {
    fixture.componentRef.setInput('post', SINGLE);
    fixture.detectChanges();

    const meta = (fixture.nativeElement as HTMLElement).querySelector(
      '.post-card__author-meta'
    ) as HTMLElement;
    const lines = Array.from(meta.querySelectorAll('ion-text')).map((el) =>
      el.textContent?.trim()
    );

    expect(lines[0]).toBe('Alicia');
    expect(lines[1]).toBe('@alicia');
    expect(lines[2]).toContain('·');
  });

  it('should size the media like the detail page', () => {
    fixture.componentRef.setInput('post', SINGLE);
    fixture.detectChanges();

    const carousel = (fixture.nativeElement as HTMLElement).querySelector(
      'app-post-media-carousel'
    ) as HTMLElement;
    expect(carousel.getAttribute('style')).toContain(
      '--post-carousel-height: 320px'
    );
  });

  it('should emit saveClick when tapping the bookmark action', () => {
    fixture.componentRef.setInput('post', SINGLE);
    fixture.detectChanges();

    let emitted = false;
    component.saveClick.subscribe(() => (emitted = true));

    const save = (fixture.nativeElement as HTMLElement).querySelectorAll(
      '.post-card__action'
    )[2] as HTMLElement;
    save.click();

    expect(emitted).toBeTrue();
  });

  it('should reserve a tappable target when the post has no text', () => {
    fixture.componentRef.setInput('post', TEXTLESS);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('.post-card__open-target')).not.toBeNull();
  });

  it('should open the post when tapping the textless target', () => {
    fixture.componentRef.setInput('post', TEXTLESS);
    fixture.detectChanges();

    let emitted: string | undefined;
    component.postClick.subscribe((id) => (emitted = id));

    (fixture.nativeElement as HTMLElement)
      .querySelector('.post-card__open-target')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(emitted).toBe('p5');
  });

  it('should not reserve the target when the post has text', () => {
    fixture.componentRef.setInput('post', SINGLE);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('.post-card__open-target')).toBeNull();
  });

  it('should not reserve the blank target when a textless post has media', () => {
    fixture.componentRef.setInput('post', TEXTLESS_IMAGE);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('.post-card__open-target')).toBeNull();
  });
});
