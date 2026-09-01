import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import {
  IonInput,
  IonSpinner,
  NavController,
} from '@ionic/angular/standalone';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NotificationService } from '@core/services/notification.service';
import { LoggerService } from '@core/services/logger.service';
import { UploadApiService } from '@core/services/media/upload/services/upload-api.service';
import { AuthService } from '@features/auth/services/auth.service';
import { of } from 'rxjs';
import { PostCreationService } from '../../services/post-creation.service';
import { PostErrorFacade } from '../../errors/post-error.facade';
import {
  PostPublishService,
  PublishResult,
} from '../../services/post-publish.service';
import { PostResponseDto } from '../../models/post.dto';
import { PostCaptionAndTagPage } from './post-caption-and-tag.page';

describe('PostCaptionAndTagPage', () => {
  let component: PostCaptionAndTagPage;
  let fixture: ComponentFixture<PostCaptionAndTagPage>;
  let routerSpy: jasmine.SpyObj<Router>;
  let navControllerSpy: jasmine.SpyObj<NavController>;
  let publishSpy: jasmine.SpyObj<PostPublishService>;
  let uploadApiSpy: jasmine.SpyObj<UploadApiService>;
  let notificationSpy: jasmine.SpyObj<NotificationService>;
  let postCreationService: PostCreationService;

  const POST_DTO: PostResponseDto = {
    id: 'post-1',
    authorId: 'user-1',
    content: 'hello #test',
    media: [
      {
        id: 'ref-1',
        mediaFileId: 'media-1',
        position: 0,
        publicUrl: 'https://storage.example.com/uploads/post.jpg',
        mimeType: 'image/jpeg',
      },
    ],
    status: 'published',
    createdAt: '2026-08-25T00:00:00Z',
    updatedAt: '2026-08-25T00:00:00Z',
  };

  beforeEach(waitForAsync(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl', 'navigate']);
    navControllerSpy = jasmine.createSpyObj('NavController', ['back']);
    publishSpy = jasmine.createSpyObj('PostPublishService', ['publish']);
    uploadApiSpy = jasmine.createSpyObj('UploadApiService', ['deleteFile']);
    notificationSpy = jasmine.createSpyObj('NotificationService', [
      'showSuccess',
    ]);

    const publishResult: PublishResult = {
      post: POST_DTO,
      mediaFileId: 'media-1',
    };
    publishSpy.publish.and.resolveTo(publishResult);

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
      imports: [
        PostCaptionAndTagPage,
        ReactiveFormsModule,
        FormsModule,
        IonInput,
        IonSpinner,
      ],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: NavController, useValue: navControllerSpy },
        { provide: PostPublishService, useValue: publishSpy },
        { provide: UploadApiService, useValue: uploadApiSpy },
        { provide: NotificationService, useValue: notificationSpy },
        { provide: PostErrorFacade, useValue: jasmine.createSpyObj('PostErrorFacade', ['handle']) },
        { provide: AuthService, useValue: authSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PostCaptionAndTagPage);
    component = fixture.componentInstance;
    postCreationService = TestBed.inject(PostCreationService);
    TestBed.inject(LoggerService);
    postCreationService.selectImage({
      src: 'blob:image-src',
      format: 'jpeg',
      origin: 'gallery',
    });
    fixture.detectChanges();
  }));

  it('should create with an image selected', () => {
    expect(component).toBeTruthy();
    expect(postCreationService.hasSelectedImage()).toBeTrue();
  });

  it('should publish, prepend to the feed and navigate home', async () => {
    component.form.controls.caption.setValue('hello');
    component.form.controls.tags.setValue('#test');

    await component.publish();

    expect(publishSpy.publish).toHaveBeenCalledWith(
      jasmine.objectContaining({
        imageSrc: 'blob:image-src',
        content: 'hello #test',
      })
    );
    expect(notificationSpy.showSuccess).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/tabs/home'], {
      replaceUrl: true,
    });
    expect(postCreationService.hasSelectedImage()).toBeFalse();
  });

  it('should send only hashtags as content when there is no caption', async () => {
    component.form.controls.tags.setValue('#sun  beach, #Sun');

    await component.publish();

    expect(publishSpy.publish).toHaveBeenCalledWith(
      jasmine.objectContaining({ content: '#sun #beach' })
    );
  });

  it('should clean up pending media when leaving without publishing', () => {
    uploadApiSpy.deleteFile.and.returnValue(of({ success: true }));
    postCreationService.setPendingMediaId('media-orphan');

    component.ionViewWillLeave();

    expect(uploadApiSpy.deleteFile).toHaveBeenCalledWith('media-orphan');
    expect(postCreationService.pendingMediaId()).toBeNull();
  });

  it('should not clean up media after a successful publish', async () => {
    uploadApiSpy.deleteFile.and.returnValue(of({ success: true }));
    // The constructor navigates back when created without an image;
    // reset so we only observe what publish() triggers.
    navControllerSpy.back.calls.reset();
    uploadApiSpy.deleteFile.calls.reset();

    await component.publish();

    // publish() resets the service; leave must not try to delete anything.
    expect(uploadApiSpy.deleteFile).not.toHaveBeenCalled();
    expect(navControllerSpy.back).not.toHaveBeenCalled();
  });
});
