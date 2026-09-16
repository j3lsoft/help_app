import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { IonIcon, IonImg, IonText, IonTextarea } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chatbubbleOutline, send } from 'ionicons/icons';
import { AuthService } from '@features/auth/services/auth.service';
import { TimeAgoPipe } from '@shared/pipes/time-ago.pipe';
import { createCommentSeed } from '../../data/post-comments.mock';
import { PostComment } from '../../models/post-comment.model';

const FALLBACK_AVATAR = 'assets/images/users/user43.png';

/**
 * Inline comments for a Post. Comments currently live only in memory (the
 * backend has no comment endpoints yet): the list is seeded from a mock and
 * new comments are appended locally.
 */
@Component({
  selector: 'app-post-comments',
  templateUrl: './post-comments.component.html',
  styleUrls: ['./post-comments.component.scss'],
  imports: [IonIcon, IonImg, IonText, IonTextarea, TimeAgoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostCommentsComponent {
  private readonly auth = inject(AuthService);

  readonly postId = input.required<string>();

  readonly comments = signal<PostComment[]>(createCommentSeed());
  readonly draft = signal('');

  readonly count = computed(() => this.comments().length);
  readonly canSubmit = computed(() => this.draft().trim().length > 0);
  readonly viewerName = computed(() => {
    const user = this.auth.currentUser();
    return user?.displayName || user?.username || 'You';
  });
  readonly viewerInitial = computed(() => {
    const name = this.viewerName().trim();
    return (name.charAt(0) || '•').toUpperCase();
  });
  readonly viewerAvatar = computed(
    () => this.auth.currentUser()?.avatarUrl || FALLBACK_AVATAR
  );

  private readonly commentInput =
    viewChild<ElementRef<HTMLElement>>('commentInput');

  constructor() {
    addIcons({ chatbubbleOutline, send });
    // A fresh Post starts a fresh local thread.
    effect(() => {
      this.postId();
      this.comments.set(createCommentSeed());
      this.draft.set('');
    });
  }

  onDraftInput(event: Event): void {
    this.draft.set((event.target as { value?: string }).value ?? '');
  }

  /** Enter posts the comment; Shift+Enter keeps inserting a newline. */
  onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter' || event.shiftKey || event.isComposing) {
      return;
    }
    event.preventDefault();
    this.submit();
  }

  submit(): void {
    const text = this.draft().trim();
    if (!text) {
      return;
    }
    const user = this.auth.currentUser();
    const comment: PostComment = {
      id: this.nextCommentId(),
      authorId: user?.id ?? 'me',
      authorName: this.viewerName(),
      authorAvatar: this.viewerAvatar(),
      text,
      createdAt: new Date().toISOString(),
    };
    this.comments.update((list) => [...list, comment]);
    this.draft.set('');
  }

  private nextCommentId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return `comment-local-${crypto.randomUUID()}`;
    }
    return `comment-local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  /** Brings the composer into view and focuses it (used by the Comments action). */
  focusInput(): void {
    const el = this.commentInput()?.nativeElement;
    if (!el) {
      return;
    }
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.focus();
  }
}
