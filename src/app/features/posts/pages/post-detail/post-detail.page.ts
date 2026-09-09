import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  rxResource,
  takeUntilDestroyed,
  toSignal,
} from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import {
  AlertController,
  IonButton,
  IonContent,
  IonIcon,
  IonImg,
  IonSpinner,
  IonText,
  IonTextarea,
  NavController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  alertCircleOutline,
  arrowBackOutline,
  chatboxEllipsesOutline,
  createOutline,
  ellipsisVertical,
  heart,
  heartOutline,
  refreshOutline,
  trashOutline,
} from 'ionicons/icons';
import { catchError, firstValueFrom, map, of } from 'rxjs';
import { AuthService } from '@features/auth/services/auth.service';
import { LoggerService } from '@core/services/logger.service';
import { NotificationService } from '@core/services/notification.service';
import { AppError } from '@core/models/app-error.model';
import { isAppError, toAppError } from '@core/utils/app-error.utils';
import { BackHeaderComponent } from '@shared/components/back-header/back-header.component';
import { PostMediaCarouselComponent } from '@shared/components/post-media-carousel/post-media-carousel.component';
import { FeedService } from '@features/home/services/feed.service';
import { PostErrorFacade } from '../../errors/post-error.facade';
import { PostsApiService } from '../../services/posts-api.service';

const FALLBACK_AVATAR = 'assets/images/users/user43.png';

@Component({
  selector: 'app-post-detail',
  templateUrl: './post-detail.page.html',
  styleUrls: ['./post-detail.page.scss'],
  imports: [
    DatePipe,
    ReactiveFormsModule,
    IonButton,
    IonContent,
    IonIcon,
    IonImg,
    IonSpinner,
    IonText,
    IonTextarea,
    BackHeaderComponent,
    PostMediaCarouselComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly navCtrl = inject(NavController);
  private readonly alertController = inject(AlertController);
  private readonly postsApi = inject(PostsApiService);
  private readonly auth = inject(AuthService);
  private readonly feed = inject(FeedService);
  private readonly notification = inject(NotificationService);
  private readonly postErrorFacade = inject(PostErrorFacade);
  private readonly logger = inject(LoggerService);

  constructor() {
    addIcons({
      alertCircleOutline,
      arrowBackOutline,
      chatboxEllipsesOutline,
      createOutline,
      ellipsisVertical,
      heart,
      heartOutline,
      refreshOutline,
      trashOutline,
    });
    this.draft.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((value) => this.draftText.set(value ?? ''));
    // Reset per-post transient UI whenever the route id changes.
    effect(() => {
      this.postId();
      this.liked.set(false);
      this.menuOpen.set(false);
      this.editing.set(false);
    });
  }

  private readonly initialPostId =
    this.route.snapshot.paramMap.get('id') ?? '';

  /**
   * Reactive route id. `ActivatedRoute.snapshot` alone goes stale when Angular
   * reuses this component for `/post-detail/A` -> `/post-detail/B` in-app
   * navigation, so we track `paramMap` and fall back to the snapshot for
   * unit tests that stub only `snapshot`.
   */
  private readonly routePostId = toSignal(
    ((this.route.paramMap as unknown as undefined) ??
      of(this.route.snapshot.paramMap as ParamMap)).pipe(
      map((params: ParamMap) => params.get('id') ?? '')
    ),
    { initialValue: this.initialPostId }
  );

  readonly postId = computed(() => this.routePostId() || this.initialPostId);
  readonly liked = signal(false);

  /**
   * Normalized load failure. The resource stores the raw failure, but this
   * Angular version throws when reading `resource.error()` (or `value()`)
   * while it holds a non-Error value, so the page keeps its own AppError copy
   * and never reads the resource failure directly.
   */
  private readonly loadError = signal<AppError | null>(null);

  private readonly postResource = rxResource({
    stream: () =>
      this.postsApi.getPostById(this.postId()).pipe(
        catchError((error: unknown) => {
          const appError = toAppError(error);
          this.loadError.set(appError);
          this.logger.error('Failed to load post detail', {
            context: 'PostDetailPage',
            data: { postId: this.postId() },
          });
          this.postErrorFacade.handle(appError, 'post-detail');
          throw appError;
        })
      ),
  });

  readonly isLoading = computed(() => this.postResource.isLoading());
  readonly post = computed(() => {
    if (this.loadError()) {
      return null;
    }
    return this.postResource.value() ?? null;
  });
  readonly postError = computed(() => this.loadError());

  readonly isNotFound = computed(() => {
    const error = this.postError();
    return isAppError(error) && error.status === 404;
  });

  readonly errorMessage = computed(() => {
    const error = this.postError();
    if (!error) {
      return '';
    }
    if (this.isNotFound()) {
      return 'Post not found.';
    }
    return isAppError(error)
      ? this.postErrorFacade.getMessage(error, 'post-detail')
      : 'Failed to load post. Please try again.';
  });

  readonly images = computed(() =>
    [...(this.post()?.media ?? [])]
      .sort((a, b) => a.position - b.position)
      .map((m) => m.publicUrl)
  );

  readonly authorName = computed((): string => {
    const post = this.post();
    const author = this.auth.currentUser();
    if (post && author && post.authorId === author.id) {
      return author.displayName || author.username || 'You';
    }
    // The v1 `GET /posts/{id}` contract returns only `authorId` with no
    // embedded author, and there is no `GET /users/{id}` endpoint to resolve
    // a foreign author by id. Show an honest placeholder instead of the
    // misleading literal "User".
    return 'Unknown author';
  });

  readonly authorInitial = computed(() => {
    const name = (this.authorName() ?? '').trim();
    return (name.charAt(0) || '•').toUpperCase();
  });

  readonly hasContent = computed(() => !!this.post()?.content?.trim());

  readonly isEdited = computed(() => {
    const post = this.post();
    return !!post && post.createdAt !== post.updatedAt;
  });

  readonly authorAvatar = computed(() => {
    const post = this.post();
    const author = this.auth.currentUser();
    if (post && author && post.authorId === author.id) {
      return author.avatarUrl || FALLBACK_AVATAR;
    }
    return FALLBACK_AVATAR;
  });

  readonly isOwner = computed(() => {
    const post = this.post();
    const author = this.auth.currentUser();
    return !!post && !!author && post.authorId === author.id;
  });

  readonly menuOpen = signal(false);
  readonly editing = signal(false);
  readonly savingEdit = signal(false);
  readonly deleting = signal(false);
  readonly draft = new FormControl<string>('', { nonNullable: true });
  /** Signal mirror of the draft control: plain control reads do not invalidate computeds. */
  readonly draftText = signal('');

  readonly canSaveEdit = computed(() => {
    if (!this.editing() || this.savingEdit()) {
      return false;
    }
    const original = this.post()?.content ?? '';
    const value = this.draftText();
    if (value === original) {
      return false;
    }
    // Text-only Posts cannot be saved with empty Content.
    return value.trim().length > 0 || this.images().length > 0;
  });

  goBack(): void {
    // Deep links have no history to pop; fall back to home instead of a dead end.
    if (typeof window !== 'undefined' && window.history.length > 1) {
      this.navCtrl.back();
    } else {
      void this.router.navigateByUrl('/tabs/home');
    }
  }

  goHome(): void {
    void this.router.navigateByUrl('/tabs/home');
  }

  retry(): void {
    this.loadError.set(null);
    this.postResource.reload();
  }

  toggleLike(): void {
    this.liked.update((liked) => !liked);
  }

  goToComments(): void {
    this.router.navigate(['comments'], {
      queryParams: { postId: this.postId() },
    });
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  startEdit(): void {
    const post = this.post();
    if (!post || !this.isOwner()) {
      return;
    }
    this.draft.setValue(post.content ?? '');
    this.menuOpen.set(false);
    this.editing.set(true);
  }

  cancelEdit(): void {
    this.editing.set(false);
  }

  async saveEdit(): Promise<void> {
    const post = this.post();
    if (!this.canSaveEdit() || !post) {
      return;
    }
    const content = this.draft.value.trim() ? this.draft.value.trim() : null;
    this.savingEdit.set(true);
    try {
      const updated = await firstValueFrom(
        this.postsApi.editPost(post.id, { content })
      );
      this.feed.updatePostContent(post.id, updated.content ?? '');
      this.editing.set(false);
      this.loadError.set(null);
      this.postResource.reload();
      await this.notification.showSuccess('Post updated');
    } catch (error) {
      const appError = toAppError(error);
      this.logger.error('Failed to edit post', {
        context: 'PostDetailPage',
        data: { postId: post.id },
      });
      this.postErrorFacade.handle(appError, 'post-edit');
      if (isAppError(appError) && appError.status === 404) {
        this.editing.set(false);
        this.postResource.reload();
      }
    } finally {
      this.savingEdit.set(false);
    }
  }

  async askDelete(): Promise<void> {
    if (!this.isOwner() || this.deleting()) {
      return;
    }
    this.menuOpen.set(false);
    const alert = await this.alertController.create({
      header: 'Delete post?',
      message: 'This cannot be undone.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => void this.deletePost(),
        },
      ],
    });
    await alert.present();
  }

  async deletePost(): Promise<void> {
    const post = this.post();
    if (!post || !this.isOwner() || this.deleting()) {
      return;
    }
    this.deleting.set(true);
    try {
      await firstValueFrom(this.postsApi.deletePost(post.id));
      this.feed.removePost(post.id);
      await this.notification.showSuccess('Post deleted');
      this.navCtrl.back();
    } catch (error) {
      const appError = toAppError(error);
      this.logger.error('Failed to delete post', {
        context: 'PostDetailPage',
        data: { postId: post.id },
      });
      this.postErrorFacade.handle(appError, 'post-delete');
      if (isAppError(appError) && appError.status === 404) {
        this.feed.removePost(post.id);
        this.navCtrl.back();
      }
    } finally {
      this.deleting.set(false);
    }
  }
}
