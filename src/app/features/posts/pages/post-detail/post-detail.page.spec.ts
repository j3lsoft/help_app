import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { NavController } from '@ionic/angular/standalone';
import { of, throwError } from 'rxjs';
import { AppError } from '@core/models/app-error.model';
import { LoggerService } from '@core/services/logger.service';
import { AuthService } from '@features/auth/services/auth.service';
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
  let postsApiSpy: jasmine.SpyObj<PostsApiService>;
  let postErrorFacadeSpy: jasmine.SpyObj<PostErrorFacade>;

  async function settle(): Promise<void> {
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve));
    fixture.detectChanges();
  }

  beforeEach(waitForAsync(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    postsApiSpy = jasmine.createSpyObj('PostsApiService', ['getPostById']);
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
          useValue: jasmine.createSpyObj('NavController', ['back']),
        },
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
});
