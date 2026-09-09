import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular/standalone';
import { of, throwError } from 'rxjs';
import { AppError } from '@core/models/app-error.model';
import { LoggerService } from '@core/services/logger.service';
import { NotificationService } from '@core/services/notification.service';
import { AuthService } from '@features/auth/services/auth.service';
import { FeedService } from '@features/home/services/feed.service';
import { PostErrorFacade } from '../../errors/post-error.facade';
import { PostResponseDto } from '../../models/post.dto';
import { PostsApiService } from '../../services/posts-api.service';
import { PostDetailPage } from './post-detail.page';

const POST_DTO: PostResponseDto = {
  id: 'post-1',
  authorId: 'user-1',
  content: 'hello carousel',
  media: [
    {
      id: 'ref-2',
      mediaFileId: 'media-2',
      position: 1,
      publicUrl: 'https://storage.example.com/b.jpg',
      mimeType: 'image/jpeg',
    },
    {
      id: 'ref-1',
      mediaFileId: 'media-1',
      position: 0,
      publicUrl: 'https://storage.example.com/a.jpg',
      mimeType: 'image/jpeg',
    },
  ],
  status: 'published',
  createdAt: '2026-08-25T00:00:00Z',
  updatedAt: '2026-08-25T00:00:00Z',
};

describe('PostDetailPage', () => {
  let component: PostDetailPage;
  let fixture: ComponentFixture<PostDetailPage>;
  let routerSpy: jasmine.SpyObj<Router>;
  let navControllerSpy: jasmine.SpyObj<NavController>;
  let alertControllerSpy: jasmine.SpyObj<AlertController>;
  let notificationSpy: jasmine.SpyObj<NotificationService>;
  let postsApiSpy: jasmine.SpyObj<PostsApiService>;
  let postErrorFacadeSpy: jasmine.SpyObj<PostErrorFacade>;
  let feedService: FeedService;

  async function settle(): Promise<void> {
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve));
    fixture.detectChanges();
  }

  beforeEach(waitForAsync(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    navControllerSpy = jasmine.createSpyObj('NavController', ['back']);
    alertControllerSpy = jasmine.createSpyObj('AlertController', ['create']);
    notificationSpy = jasmine.createSpyObj('NotificationService', [
      'showSuccess',
    ]);
    postsApiSpy = jasmine.createSpyObj('PostsApiService', [
      'getPostById',
      'editPost',
      'deletePost',
    ]);
    postErrorFacadeSpy = jasmine.createSpyObj('PostErrorFacade', [
      'handle',
      'getMessage',
    ]);
    postsApiSpy.getPostById.and.returnValue(of(POST_DTO));
    postErrorFacadeSpy.getMessage.and.returnValue('Failed to load post.');

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
      imports: [PostDetailPage],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({ id: 'post-1' }) },
          },
        },
        { provide: Router, useValue: routerSpy },
        {
          provide: NavController,
          useValue: navControllerSpy,
        },
        {
          provide: AlertController,
          useValue: alertControllerSpy,
        },
        { provide: NotificationService, useValue: notificationSpy },
        { provide: PostsApiService, useValue: postsApiSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: PostErrorFacade, useValue: postErrorFacadeSpy },
        {
          provide: LoggerService,
          useValue: jasmine.createSpyObj('LoggerService', [
            'error',
            'debug',
            'info',
            'warn',
          ]),
        },
      ],
    }).compileComponents();
  }));

  beforeEach(async () => {
    fixture = TestBed.createComponent(PostDetailPage);
    component = fixture.componentInstance;
    feedService = TestBed.inject(FeedService);
    fixture.detectChanges();
    await settle();
  });

  it('should create and fetch the post by id', () => {
    expect(component).toBeTruthy();
    expect(postsApiSpy.getPostById).toHaveBeenCalledWith('post-1');
    expect(component.post()).toEqual(POST_DTO);
  });

  it('should render author, content and carousel images in position order', () => {
    expect(component.images()).toEqual([
      'https://storage.example.com/a.jpg',
      'https://storage.example.com/b.jpg',
    ]);

    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent).toContain('Tester');
    expect(host.textContent).toContain('hello carousel');
    expect(host.querySelectorAll('.carousel__image').length).toBe(2);
  });

  it('should toggle like locally', () => {
    expect(component.liked()).toBeFalse();
    component.toggleLike();
    expect(component.liked()).toBeTrue();
  });

  it('should navigate to comments carrying the post id', () => {
    component.goToComments();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['comments'], {
      queryParams: { postId: 'post-1' },
    });
  });

  it('should show not-found for missing posts', async () => {
    const notFound: AppError = { status: 404, handled: false };
    postsApiSpy.getPostById.and.returnValue(throwError(() => notFound));

    fixture = TestBed.createComponent(PostDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await settle();

    expect(component.isNotFound()).toBeTrue();
    expect(component.errorMessage()).toBe('Post not found.');
    expect(postErrorFacadeSpy.handle).toHaveBeenCalled();
  });

  it('should show retryable error when loading fails', async () => {
    const serverError: AppError = { status: 500, handled: false };
    postsApiSpy.getPostById.and.returnValue(throwError(() => serverError));

    fixture = TestBed.createComponent(PostDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await settle();

    expect(component.isNotFound()).toBeFalse();
    expect(postErrorFacadeSpy.handle).toHaveBeenCalled();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Retry'
    );
  });

  it('should expose the owner menu for own posts', () => {
    expect(component.isOwner()).toBeTrue();
    component.toggleMenu();
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent).toContain('Edit');
    expect(host.textContent).toContain('Delete');
  });

  it('should start and cancel editing without calling the API', () => {
    component.startEdit();

    expect(component.editing()).toBeTrue();
    expect(component.draft.value).toBe('hello carousel');
    expect(component.canSaveEdit()).toBeFalse();

    component.draft.setValue('hello carousel!');
    expect(component.canSaveEdit()).toBeTrue();

    component.cancelEdit();

    expect(component.editing()).toBeFalse();
    expect(postsApiSpy.editPost).not.toHaveBeenCalled();
  });

  it('should save edits and reflect them in the feed', async () => {
    const updated = { ...POST_DTO, content: 'edited content' };
    postsApiSpy.editPost.and.returnValue(of(updated));
    postsApiSpy.getPostById.and.returnValue(of(updated));
    feedService.prependPost({
      id: 'post-1',
      userProfilePic: '',
      userName: 'Tester',
      userDetail: '',
      aboutPost: 'hello carousel',
      postLikes: '0',
      postComments: '0',
      postShares: '0',
      postImage: '',
      postImages: [],
      postLike: false,
    });

    component.startEdit();
    component.draft.setValue('edited content');
    await component.saveEdit();
    await settle();

    expect(postsApiSpy.editPost).toHaveBeenCalledWith('post-1', {
      content: 'edited content',
    });
    expect(
      feedService.posts().find((p) => p.id === 'post-1')?.aboutPost
    ).toBe('edited content');
    expect(component.editing()).toBeFalse();
    expect(notificationSpy.showSuccess).toHaveBeenCalledWith('Post updated');
  });

  it('should surface forbidden edits via the facade and stay in edit mode', async () => {
    const forbidden: AppError = { status: 403, handled: false };
    postsApiSpy.editPost.and.returnValue(throwError(() => forbidden));

    component.startEdit();
    component.draft.setValue('nope');
    await component.saveEdit();

    expect(postErrorFacadeSpy.handle).toHaveBeenCalledWith(
      forbidden,
      'post-edit'
    );
    expect(component.editing()).toBeTrue();
  });

  it('should ask for confirmation before deleting', async () => {
    const present = jasmine.createSpy('present').and.resolveTo();
    alertControllerSpy.create.and.resolveTo({ present } as never);

    await component.askDelete();

    expect(alertControllerSpy.create).toHaveBeenCalledWith(
      jasmine.objectContaining({ header: 'Delete post?' })
    );
    expect(present).toHaveBeenCalled();
    expect(postsApiSpy.deletePost).not.toHaveBeenCalled();
  });

  it('should delete after confirm, update the feed and go back', async () => {
    const present = jasmine.createSpy('present').and.resolveTo();
    alertControllerSpy.create.and.resolveTo({ present } as never);
    postsApiSpy.deletePost.and.returnValue(of(void 0));
    feedService.prependPost({
      id: 'post-1',
      userProfilePic: '',
      userName: 'Tester',
      userDetail: '',
      aboutPost: 'hello carousel',
      postLikes: '0',
      postComments: '0',
      postShares: '0',
      postImage: '',
      postImages: [],
      postLike: false,
    });

    await component.askDelete();
    const recent = alertControllerSpy.create.calls.mostRecent();
    const firstArg = recent?.args[0] as
      | { buttons?: { role?: string; handler?: () => void }[] }
      | undefined;
    const buttons = firstArg?.buttons ?? [];
    const destructive = buttons.find((b) => b.role === 'destructive');
    await destructive?.handler?.();
    await settle();

    expect(postsApiSpy.deletePost).toHaveBeenCalledWith('post-1');
    expect(feedService.posts().some((p) => p.id === 'post-1')).toBeFalse();
    expect(notificationSpy.showSuccess).toHaveBeenCalledWith('Post deleted');
    expect(navControllerSpy.back).toHaveBeenCalled();
  });

  it('should surface forbidden deletes via the facade and stay', async () => {
    postsApiSpy.deletePost.and.returnValue(
      throwError(() => ({ status: 403, handled: false }))
    );

    await component.deletePost();

    expect(postErrorFacadeSpy.handle).toHaveBeenCalledWith(
      jasmine.objectContaining({ status: 403 }),
      'post-delete'
    );
    expect(navControllerSpy.back).not.toHaveBeenCalled();
  });

  it('should leave edit mode and show not-found when the post is gone', async () => {
    postsApiSpy.editPost.and.returnValue(
      throwError(() => ({ status: 404, handled: false }))
    );
    postsApiSpy.getPostById.and.returnValue(
      throwError(() => ({ status: 404, handled: false }))
    );

    component.startEdit();
    component.draft.setValue('gone');
    await component.saveEdit();
    await settle();

    expect(postErrorFacadeSpy.handle).toHaveBeenCalledWith(
      jasmine.objectContaining({ status: 404 }),
      'post-edit'
    );
    expect(component.editing()).toBeFalse();
    expect(component.isNotFound()).toBeTrue();
  });

  it('should go back when deleting an already missing post', async () => {
    postsApiSpy.deletePost.and.returnValue(
      throwError(() => ({ status: 404, handled: false }))
    );
    feedService.prependPost({
      id: 'post-1',
      userProfilePic: '',
      userName: 'Tester',
      userDetail: '',
      aboutPost: 'hello carousel',
      postLikes: '0',
      postComments: '0',
      postShares: '0',
      postImage: '',
      postImages: [],
      postLike: false,
    });

    await component.deletePost();

    expect(postErrorFacadeSpy.handle).toHaveBeenCalledWith(
      jasmine.objectContaining({ status: 404 }),
      'post-delete'
    );
    expect(feedService.posts().some((p) => p.id === 'post-1')).toBeFalse();
    expect(navControllerSpy.back).toHaveBeenCalled();
  });
});

describe('PostDetailPage as visitor', () => {
  it('should hide the owner menu for foreign posts', async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const postsApiSpy = jasmine.createSpyObj('PostsApiService', [
      'getPostById',
      'editPost',
      'deletePost',
    ]);
    postsApiSpy.getPostById.and.returnValue(of(POST_DTO));

    const authSpy = jasmine.createSpyObj<AuthService>('AuthService', [], [
      'currentUser',
    ]);
    Object.defineProperty(authSpy, 'currentUser', {
      value: () => ({
        id: 'user-2',
        email: 'b@c.com',
        emailVerified: true,
        username: 'visitor',
        displayName: 'Visitor',
        avatarUrl: null,
      }),
    });

    await TestBed.configureTestingModule({
      imports: [PostDetailPage],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({ id: 'post-1' }) },
          },
        },
        { provide: Router, useValue: routerSpy },
        {
          provide: NavController,
          useValue: jasmine.createSpyObj('NavController', ['back']),
        },
        {
          provide: AlertController,
          useValue: jasmine.createSpyObj('AlertController', ['create']),
        },
        {
          provide: NotificationService,
          useValue: jasmine.createSpyObj('NotificationService', [
            'showSuccess',
          ]),
        },
        { provide: PostsApiService, useValue: postsApiSpy },
        { provide: AuthService, useValue: authSpy },
        {
          provide: PostErrorFacade,
          useValue: jasmine.createSpyObj('PostErrorFacade', [
            'handle',
            'getMessage',
          ]),
        },
        {
          provide: LoggerService,
          useValue: jasmine.createSpyObj('LoggerService', [
            'error',
            'debug',
            'info',
            'warn',
          ]),
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(PostDetailPage);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve));
    fixture.detectChanges();

    expect(component.isOwner()).toBeFalse();
    expect(
      (fixture.nativeElement as HTMLElement).querySelector(
        '.detail__options-icon'
      )
    ).toBeNull();
  });
});
