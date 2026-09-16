import { ComponentFixture, TestBed, waitForAsync, fakeAsync, flush } from '@angular/core/testing';
import { Router } from '@angular/router';
import { CameraService } from '@core/services/camera/camera.service';
import { LoggerService } from '@core/services/logger.service';
import { NotificationService } from '@core/services/notification.service';
import { UploadApiService } from '@core/services/media/upload/services/upload-api.service';
import { AuthService } from '@features/auth/services/auth.service';
import { of } from 'rxjs';
import { PostCreationService } from '../../services/post-creation.service';
import { DeviceGalleryService } from '../../services/device-gallery.service';
import {
  PostPublishError,
  PostPublishService,
  PublishParams,
  PublishResult,
} from '../../services/post-publish.service';
import { PostErrorFacade } from '../../errors/post-error.facade';
import { PostResponseDto } from '../../models/post.dto';
import { ComposerPage } from './composer.page';

describe('ComposerPage', () => {
  let component: ComposerPage;
  let fixture: ComponentFixture<ComposerPage>;
  let routerSpy: jasmine.SpyObj<Router>;
  let gallerySpy: jasmine.SpyObj<DeviceGalleryService>;
  let cameraSpy: jasmine.SpyObj<CameraService>;
  let uploadApiSpy: jasmine.SpyObj<UploadApiService>;
  let publishSpy: jasmine.SpyObj<PostPublishService>;
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
    routerSpy = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
    gallerySpy = jasmine.createSpyObj('DeviceGalleryService', [
      'pickFromGallery',
      'fromFile',
      'fromFiles',
    ]);
    cameraSpy = jasmine.createSpyObj('CameraService', ['takePhoto']);
    uploadApiSpy = jasmine.createSpyObj('UploadApiService', ['deleteFile']);
    publishSpy = jasmine.createSpyObj('PostPublishService', ['publish']);
    notificationSpy = jasmine.createSpyObj('NotificationService', [
      'showSuccess',
    ]);

    const publishResult: PublishResult = {
      post: POST_DTO,
      mediaFileId: 'media-1',
      mediaFileIds: ['media-1'],
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
      imports: [ComposerPage],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: DeviceGalleryService, useValue: gallerySpy },
        { provide: CameraService, useValue: cameraSpy },
        { provide: UploadApiService, useValue: uploadApiSpy },
        { provide: PostPublishService, useValue: publishSpy },
        { provide: NotificationService, useValue: notificationSpy },
        {
          provide: PostErrorFacade,
          useValue: jasmine.createSpyObj('PostErrorFacade', ['handle']),
        },
        { provide: AuthService, useValue: authSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ComposerPage);
    component = fixture.componentInstance;
    postCreationService = TestBed.inject(PostCreationService);
    TestBed.inject(LoggerService);
    fixture.detectChanges();
  }));

  it('should create with no image and Post action disabled', () => {
    expect(component).toBeTruthy();
    expect(component.canPublish()).toBeFalse();
  });

  it('should enable Post with a selected image', () => {
    postCreationService.addImage({
      src: 'blob:x',
      format: 'jpeg',
      origin: 'gallery',
    });
    fixture.detectChanges();
    expect(component.canPublish()).toBeTrue();
  });

  it('should enable Post for text-only content', () => {
    component.form.controls.caption.setValue('hello');
    fixture.detectChanges();
    expect(component.canPublish()).toBeTrue();
  });

  it('should store images selected from device gallery', async () => {
    gallerySpy.pickFromGallery.and.resolveTo([
      {
        src: 'blob:image-src',
        format: 'jpeg',
        origin: 'gallery',
      },
    ]);

    await component.pickFromGallery();

    expect(postCreationService.selectedImageSrc()).toBe('blob:image-src');
    expect(postCreationService.hasMedia()).toBeTrue();
  });

  it('should keep nothing selected when user dismisses picker', async () => {
    gallerySpy.pickFromGallery.and.resolveTo([]);

    await component.pickFromGallery();

    expect(postCreationService.hasMedia()).toBeFalse();
  });

  it('should map camera result to selected image', async () => {
    cameraSpy.takePhoto.and.resolveTo({
      dataUrl: 'data:image/jpeg;base64,abc',
      format: 'jpeg',
    });

    await component.takePhoto();

    expect(postCreationService.selectedImageSrc()).toBe(
      'data:image/jpeg;base64,abc'
    );
  });

  it('should select dropped files as images', () => {
    const file = new File(['x'], 'photo.png', { type: 'image/png' });
    gallerySpy.fromFiles.and.returnValue([
      {
        src: 'blob:dropped',
        format: 'png',
        origin: 'web',
      },
    ]);

    component.onDrop({
      preventDefault: () => undefined,
      dataTransfer: { files: [file] },
    } as unknown as DragEvent);

    expect(gallerySpy.fromFiles).toHaveBeenCalled();
    expect(postCreationService.selectedImageSrc()).toBe('blob:dropped');
  });

  it('should ignore drops without a file', () => {
    component.onDrop({
      preventDefault: () => undefined,
      dataTransfer: { files: [] },
    } as unknown as DragEvent);

    expect(postCreationService.hasMedia()).toBeFalse();
  });

  it('should remove image keeping form content', () => {
    const id = postCreationService.addImage({
      src: 'blob:x',
      format: 'jpeg',
      origin: 'gallery',
    })!;
    component.form.controls.caption.setValue('keep me');

    component.removeItem(id);

    expect(postCreationService.hasMedia()).toBeFalse();
    expect(component.form.controls.caption.value).toBe('keep me');
  });

  it('should open photo editor for specific item id', () => {
    const id = postCreationService.addImage({
      src: 'blob:x',
      format: 'jpeg',
      origin: 'gallery',
    })!;

    component.openEditor(id);
    expect(component.isEditorOpen()).toBeTrue();
    expect(postCreationService.activeItemId()).toBe(id);

    component.closeEditor();
    expect(component.isEditorOpen()).toBeFalse();
  });

  it('should publish, prepend to feed and navigate home', async () => {
    postCreationService.addImage({
      src: 'blob:image-src',
      format: 'jpeg',
      origin: 'gallery',
    });
    component.form.controls.caption.setValue('hello');

    await component.publish();

    expect(publishSpy.publish).toHaveBeenCalledWith(
      jasmine.objectContaining({
        content: 'hello',
      })
    );
    expect(notificationSpy.showSuccess).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/tabs/home'], {
      replaceUrl: true,
    });
    expect(postCreationService.hasMedia()).toBeFalse();
  });

  it('should publish text-only posts without an image when content is present', async () => {
    component.form.controls.caption.setValue('hello text');

    await component.publish();

    expect(publishSpy.publish).toHaveBeenCalledWith(
      jasmine.objectContaining({ content: 'hello text' })
    );
    expect(notificationSpy.showSuccess).toHaveBeenCalled();
  });

  it('should block empty posts with no image and no content', async () => {
    publishSpy.publish.calls.reset();
    component.form.controls.caption.setValue('   ');

    await component.publish();

    expect(publishSpy.publish).not.toHaveBeenCalled();
  });

  it('should show publishing overlay with stage and progress', fakeAsync(() => {
    postCreationService.addImage({
      src: 'blob:image-src',
      format: 'jpeg',
      origin: 'gallery',
    });
    let resolvePublish!: (result: PublishResult) => void;
    publishSpy.publish.and.callFake((params: PublishParams) => {
      params.onStage?.('uploading');
      params.onUploadProgress?.(42);
      return new Promise<PublishResult>((resolve) => {
        resolvePublish = resolve;
      });
    });
    component.form.controls.caption.setValue('hello');

    const promise = component.publish();

    expect(component.isPublishing()).toBeTrue();
    expect(component.publishStage()).toBe('uploading');
    expect(component.uploadProgress()).toBe(42);

    resolvePublish({ post: POST_DTO, mediaFileId: 'media-1', mediaFileIds: ['media-1'] });
    flush();

    expect(component.isPublishing()).toBeFalse();
    expect(component.publishStage()).toBeNull();
    void promise;
  }));

  it('should keep content and reuse pending media for retry when publish fails', async () => {
    postCreationService.addImage({
      src: 'blob:image-src',
      format: 'jpeg',
      origin: 'gallery',
    });
    publishSpy.publish.and.rejectWith(
      new PostPublishError('Post creation failed', 'creating', undefined, 'media-uploaded', ['media-uploaded'])
    );
    component.form.controls.caption.setValue('keep me');

    await component.publish();

    expect(component.form.controls.caption.value).toBe('keep me');
    expect(postCreationService.pendingMediaId()).toBe('media-uploaded');
    expect(uploadApiSpy.deleteFile).not.toHaveBeenCalled();
  });

  it('should clean up pending media when leaving without publishing', () => {
    uploadApiSpy.deleteFile.and.returnValue(of({ success: true }));
    postCreationService.addImage({
      src: 'blob:x',
      format: 'jpeg',
      origin: 'gallery',
    });
    postCreationService.setPendingMediaId('media-orphan');

    component.ionViewWillLeave();

    expect(uploadApiSpy.deleteFile).toHaveBeenCalledWith('media-orphan');
    expect(postCreationService.pendingMediaId()).toBeNull();
  });

  it('should clear local draft when leaving without server pending media', () => {
    postCreationService.addImage({
      src: 'blob:local',
      format: 'jpeg',
      origin: 'gallery',
    });
    component.form.controls.caption.setValue('draft caption');

    component.ionViewWillLeave();

    expect(postCreationService.hasMedia()).toBeFalse();
    expect(component.form.controls.caption.value).toBe('');
    expect(uploadApiSpy.deleteFile).not.toHaveBeenCalled();
  });

  it('should not clean up media after a successful publish', async () => {
    uploadApiSpy.deleteFile.and.returnValue(of({ success: true }));
    postCreationService.addImage({
      src: 'blob:image-src',
      format: 'jpeg',
      origin: 'gallery',
    });

    await component.publish();

    expect(uploadApiSpy.deleteFile).not.toHaveBeenCalled();
  });

  it('should clean up orphaned media and navigate home on exit', async () => {
    uploadApiSpy.deleteFile.and.returnValue(of({ success: true }));
    postCreationService.addImage({
      src: 'blob:x',
      format: 'jpeg',
      origin: 'gallery',
    });
    postCreationService.setPendingMediaId('media-1');

    await component.goHome();

    expect(uploadApiSpy.deleteFile).toHaveBeenCalledWith('media-1');
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/tabs/home');
    expect(postCreationService.pendingMediaId()).toBeNull();
  });
});