import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { CameraService } from '@core/services/camera/camera.service';
import { LoggerService } from '@core/services/logger.service';
import { UploadApiService } from '@core/services/media/upload/services/upload-api.service';
import { of } from 'rxjs';
import { PostCreationService } from '../../services/post-creation.service';
import { DeviceGalleryService } from '../../services/device-gallery.service';
import { CreatePostPage } from './create-post.page';

describe('CreatePostPage', () => {
  let component: CreatePostPage;
  let fixture: ComponentFixture<CreatePostPage>;
  let routerSpy: jasmine.SpyObj<Router>;
  let gallerySpy: jasmine.SpyObj<DeviceGalleryService>;
  let cameraSpy: jasmine.SpyObj<CameraService>;
  let uploadApiSpy: jasmine.SpyObj<UploadApiService>;
  let postCreationService: PostCreationService;

  beforeEach(waitForAsync(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
    gallerySpy = jasmine.createSpyObj('DeviceGalleryService', [
      'pickFromGallery',
    ]);
    cameraSpy = jasmine.createSpyObj('CameraService', ['takePhoto']);
    uploadApiSpy = jasmine.createSpyObj('UploadApiService', ['deleteFile']);

    TestBed.configureTestingModule({
      imports: [CreatePostPage],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: DeviceGalleryService, useValue: gallerySpy },
        { provide: CameraService, useValue: cameraSpy },
        { provide: UploadApiService, useValue: uploadApiSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreatePostPage);
    component = fixture.componentInstance;
    postCreationService = TestBed.inject(PostCreationService);
    TestBed.inject(LoggerService);
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should go to caption for text-only posts without a selected image', () => {
    component.goToPostFilter();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/post-caption-and-tag']);
  });

  it('should go to filter when an image is selected', () => {
    postCreationService.selectImage({ src: 'blob:x', format: 'jpeg', origin: 'gallery' });
    component.goToPostFilter();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/post-filter']);
  });

  it('should store the image selected from the device gallery', async () => {
    gallerySpy.pickFromGallery.and.resolveTo({
      src: 'blob:image-src',
      format: 'jpeg',
      origin: 'gallery',
    });

    await component.pickFromGallery();

    expect(postCreationService.selectedImageSrc()).toBe('blob:image-src');
    expect(postCreationService.hasSelectedImage()).toBeTrue();
  });

  it('should keep nothing selected when the user dismisses the picker', async () => {
    gallerySpy.pickFromGallery.and.resolveTo(null);

    await component.pickFromGallery();

    expect(postCreationService.hasSelectedImage()).toBeFalse();
  });

  it('should map the camera result to the selected image', async () => {
    cameraSpy.takePhoto.and.resolveTo({
      dataUrl: 'data:image/jpeg;base64,abc',
      format: 'jpeg',
    });

    await component.takePhoto();

    expect(postCreationService.selectedImageSrc()).toBe(
      'data:image/jpeg;base64,abc'
    );
  });

  it('should clean up orphaned media and navigate home on exit', async () => {
    uploadApiSpy.deleteFile.and.returnValue(of({ success: true }));
    postCreationService.setPendingMediaId('media-1');

    await component.goHome();

    expect(uploadApiSpy.deleteFile).toHaveBeenCalledWith('media-1');
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/tabs/home');
    expect(postCreationService.pendingMediaId()).toBeNull();
  });
});
