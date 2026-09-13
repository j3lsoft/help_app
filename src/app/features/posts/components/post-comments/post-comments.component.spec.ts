import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AuthService } from '@features/auth/services/auth.service';
import { PostCommentsComponent } from './post-comments.component';

describe('PostCommentsComponent', () => {
  let component: PostCommentsComponent;
  let fixture: ComponentFixture<PostCommentsComponent>;

  beforeEach(waitForAsync(() => {
    const authSpy = jasmine.createSpyObj<AuthService>('AuthService', [], [
      'currentUser',
    ]);
    Object.defineProperty(authSpy, 'currentUser', {
      value: () => ({
        id: 'user-1',
        email: 'a@b.com',
        emailVerified: true,
        username: 'tester',
        displayName: 'Tester',
        avatarUrl: null,
      }),
    });

    TestBed.configureTestingModule({
      imports: [PostCommentsComponent],
      providers: [{ provide: AuthService, useValue: authSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(PostCommentsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('postId', 'post-1');
    fixture.detectChanges();
  }));

  it('should seed a local thread', () => {
    expect(component.comments().length).toBeGreaterThan(0);
    expect(component.count()).toBe(component.comments().length);
  });

  it('should append a comment written by the current user', () => {
    component.draft.set('Nice shot');
    component.submit();

    const list = component.comments();
    const last = list[list.length - 1];
    expect(last?.text).toBe('Nice shot');
    expect(last?.authorName).toBe('Tester');
    expect(component.draft()).toBe('');
  });

  it('should ignore empty submissions', () => {
    const before = component.comments().length;
    component.draft.set('   ');
    component.submit();
    expect(component.comments().length).toBe(before);
  });

  it('should render comments without a like control', () => {
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelectorAll('.comments__item').length).toBe(
      component.comments().length
    );
    expect(host.querySelector('.comments__like')).toBeNull();
  });

  it('should place the composer above the comments list', () => {
    const host = fixture.nativeElement as HTMLElement;
    const composer = host.querySelector('.comments__composer') as HTMLElement;
    const list = host.querySelector('.comments__list') as HTMLElement;

    expect(composer).not.toBeNull();
    expect(list).not.toBeNull();
    expect(
      composer.compareDocumentPosition(list) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it('should not render a comments heading or count above the composer', () => {
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('.comments__header')).toBeNull();
    expect(host.querySelector('.comments__title')).toBeNull();
    expect(host.querySelector('.comments__count')).toBeNull();
  });

  it('should disable the send button until the draft has text', () => {
    const host = fixture.nativeElement as HTMLElement;
    const send = host.querySelector('.comments__send') as HTMLButtonElement;

    expect(send.disabled).toBeTrue();

    component.draft.set('Nice');
    fixture.detectChanges();

    expect(send.disabled).toBeFalse();
  });

  it('should show the viewer fallback initial behind the composer avatar', () => {
    const host = fixture.nativeElement as HTMLElement;
    const fallback = host.querySelector(
      '.comments__composer .comments__avatar-fallback'
    );
    expect(fallback?.textContent?.trim()).toBe('T');
  });

  it('should submit on Enter without shift', () => {
    component.draft.set('Sent with Enter');
    const event = {
      key: 'Enter',
      shiftKey: false,
      isComposing: false,
      preventDefault: jasmine.createSpy('preventDefault'),
    } as unknown as KeyboardEvent;

    component.onKeydown(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(component.draft()).toBe('');
    const list = component.comments();
    expect(list[list.length - 1]?.text).toBe('Sent with Enter');
  });

  it('should keep Shift+Enter for newlines', () => {
    component.draft.set('Line one');
    const event = {
      key: 'Enter',
      shiftKey: true,
      isComposing: false,
      preventDefault: jasmine.createSpy('preventDefault'),
    } as unknown as KeyboardEvent;

    component.onKeydown(event);

    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(component.draft()).toBe('Line one');
  });
});
