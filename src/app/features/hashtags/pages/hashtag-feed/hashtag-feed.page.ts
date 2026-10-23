import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorMapConfig } from '@core/errors/error-map.interface';
import { ErrorFacade } from '@core/errors/facades/error.facade';
import { AppError } from '@core/models/app-error.model';
import {
  IonContent,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonRefresher,
  IonRefresherContent,
  IonText,
  NavController,
  ViewWillEnter,
} from '@ionic/angular/standalone';
import { FeedService } from '@features/home/services/feed.service';
import { PostCardComponent } from '@features/home/components/post-card/post-card.component';
import { toPostView } from '@features/posts/adapters/post-view.adapter';
import { PostResponseDto } from '@features/posts/models/post.dto';
import { Post } from '@features/posts/models/post-view.model';
import { PostsApiService } from '@features/posts/services/posts-api.service';
import { buildPostDetailUrl } from '@features/posts/utils/post-detail-url.util';
import { applyPostOverrides } from '@features/posts/utils/post-overrides.util';
import { BackHeaderComponent } from '@shared/components/back-header/back-header.component';
import { catchError, EMPTY, finalize } from 'rxjs';

const PAGE_SIZE = 20;

/** Tag-page failures outside the technical band (0/429/5xx, handled elsewhere). */
const HASHTAG_ERROR_MAP: ErrorMapConfig = {
  fallback: 'Could not load posts for this hashtag. Please try again.',
};

/**
 * Posts carrying one hashtag, newest first. The endpoint embeds no author, so
 * the masthead shows a neutral fallback; that gap is tracked as a backend
 * follow-up (see docs/adr/0011).
 */
@Component({
  selector: 'app-hashtag-feed',
  templateUrl: './hashtag-feed.page.html',
  styleUrls: ['./hashtag-feed.page.scss'],
  imports: [
    IonContent,
    IonRefresher,
    IonRefresherContent,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonText,
    BackHeaderComponent,
    PostCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HashtagFeedPage implements ViewWillEnter {
  private readonly router = inject(Router);
  private readonly navCtrl = inject(NavController);
  private readonly route = inject(ActivatedRoute);
  private readonly postsApi = inject(PostsApiService);
  private readonly feed = inject(FeedService);
  private readonly errorFacade = inject(ErrorFacade);

  readonly tag = this.route.snapshot.paramMap.get('tag') ?? '';

  private readonly _items = signal<PostResponseDto[]>([]);
  private readonly _loaded = signal(false);
  private readonly _loadingMore = signal(false);
  private nextCursor: string | null = null;

  /**
   * Server items projected through the session mutation log on every read, so
   * a delete/edit/like anywhere reflects here immediately (ADR-0007).
   */
  readonly posts = computed<Post[]>(() => {
    const overrides = this.feed.overrides();
    return this._items()
      .map((dto) =>
        applyPostOverrides(
          toPostView(dto, { author: null, fallbackName: 'Unknown author' }),
          overrides
        )
      )
      .filter((post): post is Post => post !== null);
  });
  readonly loaded = this._loaded.asReadonly();
  readonly hasMore = signal(false);

  ionViewWillEnter(): void {
    this.refresh();
  }

  goBack(): void {
    this.navCtrl.back();
  }

  goToPostDetail(postId: string, imageIndex?: number): void {
    void this.router.navigateByUrl(buildPostDetailUrl(postId, imageIndex));
  }

  goToHashtag(tag: string): void {
    void this.router.navigate(['/hashtag', tag]);
  }

  handleLike(postId: string): void {
    this.feed.toggleLike(postId);
  }

  handleSave(postId: string): void {
    this.feed.toggleSave(postId);
  }

  handleRefresh(event: CustomEvent): void {
    this.refresh(() =>
      (event.target as unknown as { complete: () => void }).complete()
    );
  }

  loadMore(event: CustomEvent): void {
    const complete = () =>
      (event.target as unknown as { complete: () => void }).complete();

    const cursor = this.nextCursor;
    if (!cursor || this._loadingMore()) {
      complete();
      return;
    }
    this._loadingMore.set(true);

    this.postsApi
      .getPostsByHashtag(this.tag, { limit: PAGE_SIZE, cursor })
      .pipe(
        catchError((error: AppError) => {
          this.errorFacade.handle(error, HASHTAG_ERROR_MAP);
          return EMPTY;
        }),
        finalize(() => {
          this._loadingMore.set(false);
          complete();
        })
      )
      .subscribe((page) => {
        this.nextCursor = page.nextCursor;
        this.hasMore.set(page.nextCursor !== null);
        this._items.update((items) => [...items, ...page.items]);
      });
  }

  private refresh(done?: () => void): void {
    this.postsApi
      .getPostsByHashtag(this.tag, { limit: PAGE_SIZE })
      .pipe(
        catchError((error: AppError) => {
          // Keep the current list visible (stale-while-revalidate) and message.
          this.errorFacade.handle(error, HASHTAG_ERROR_MAP);
          return EMPTY;
        }),
        finalize(() => {
          this._loaded.set(true);
          done?.();
        })
      )
      .subscribe((page) => {
        this.nextCursor = page.nextCursor;
        this.hasMore.set(page.nextCursor !== null);
        this._items.set(page.items);
      });
  }
}
