import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent,
  IonIcon,
  IonImg,
  IonSpinner,
  IonText,
  NavController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  chatboxEllipsesOutline,
  heart,
  heartOutline,
} from 'ionicons/icons';
import { catchError } from 'rxjs';
import { AuthService } from '@features/auth/services/auth.service';
import { LoggerService } from '@core/services/logger.service';
import { AppError } from '@core/models/app-error.model';
import { isAppError, toAppError } from '@core/utils/app-error.utils';
import { BackHeaderComponent } from '@shared/components/back-header/back-header.component';
import { PostMediaCarouselComponent } from '@shared/components/post-media-carousel/post-media-carousel.component';
import { PostErrorFacade } from '../../errors/post-error.facade';
import { PostsApiService } from '../../services/posts-api.service';

const FALLBACK_AVATAR = 'assets/images/users/user43.png';

@Component({
  selector: 'app-post-detail',
  templateUrl: './post-detail.page.html',
  styleUrls: ['./post-detail.page.scss'],
  imports: [
    DatePipe,
    IonContent,
    IonIcon,
    IonImg,
    IonSpinner,
    IonText,
    BackHeaderComponent,
    PostMediaCarouselComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly navCtrl = inject(NavController);
  private readonly postsApi = inject(PostsApiService);
  private readonly auth = inject(AuthService);
  private readonly postErrorFacade = inject(PostErrorFacade);
  private readonly logger = inject(LoggerService);

  readonly postId = signal(
    this.route.snapshot.paramMap.get('id') ?? ''
  );
  readonly liked = signal(false);

  /**
   * Normalized load failure. rxResource also tracks the raw failure, but its
   * stored error shape is not reliable for status checks, so the page keeps
   * its own AppError copy set in the same catchError that notifies the facade.
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
  readonly post = computed(() => this.postResource.value() ?? null);
  readonly postError = computed(
    () => this.loadError() ?? this.postResource.error()
  );

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

  readonly authorName = computed(() => {
    const post = this.post();
    const author = this.auth.currentUser();
    if (post && author && post.authorId === author.id) {
      return author.displayName || author.username;
    }
    return 'User';
  });

  readonly authorAvatar = computed(() => {
    const post = this.post();
    const author = this.auth.currentUser();
    if (post && author && post.authorId === author.id) {
      return author.avatarUrl || FALLBACK_AVATAR;
    }
    return FALLBACK_AVATAR;
  });

  goBack(): void {
    this.navCtrl.back();
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
}
