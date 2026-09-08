import { TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import { LoggerService } from '@core/services/logger.service';
import { UploadApiService } from '@core/services/media/upload/services/upload-api.service';
import { MediaFileResponseDto } from '../../../core/services/media/upload/models';
import { PostsApiService } from './posts-api.service';
import {
  PostPublishError,
  PostPublishService,
  PublishStage,
} from './post-publish.service';
import { PostResponseDto } from '../models/post.dto';

describe('PostPublishService', () => {
  let service: PostPublishService;
  let uploadApiSpy: jasmine.SpyObj<UploadApiService>;
  let postsApiSpy: jasmine.SpyObj<PostsApiService>;

  const MEDIA: MediaFileResponseDto = {
    id: 'media-1',
    key: 'uploads/post.jpg',
    publicUrl: 'https://storage.example.com/uploads/post.jpg',
    mimeType: 'image/jpeg',
    size: 1024,
    ownerId: 'user-1',
  };

  const POST_DTO: PostResponseDto = {
    id: 'post-1',
    authorId: 'user-1',
    content: 'hi',
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

  // 2x2 red PNG pixel
  const TINY_PNG =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAEklEQVR42mP8z8AAAwDAfgAHjfoLpAAAAABJRU5ErkJggg==';

  beforeEach(() => {
    uploadApiSpy = jasmine.createSpyObj('UploadApiService', [
      'getPresignedUrl',
      'uploadToStorage',
      'confirmUpload',
      'deleteFile',
    ]);
    postsApiSpy = jasmine.createSpyObj('PostsApiService', ['createPost']);

    uploadApiSpy.getPresignedUrl.and.returnValue(
      of({ id: 'presigned-id', key: 'uploads/key', uploadUrl: 'https://s3/put' })
    );
    uploadApiSpy.uploadToStorage.and.returnValue(of(100));
    uploadApiSpy.confirmUpload.and.returnValue(of(MEDIA));
    postsApiSpy.createPost.and.returnValue(of(POST_DTO));

    TestBed.configureTestingModule({
      providers: [
        PostPublishService,
        { provide: UploadApiService, useValue: uploadApiSpy },
        { provide: PostsApiService, useValue: postsApiSpy },
      ],
    });
    service = TestBed.inject(PostPublishService);
    TestBed.inject(LoggerService);
  });

  it('should bake, upload via presigned flow and create the post', async () => {
    const stages: PublishStage[] = [];
    const progress: number[] = [];

    const result = await service.publish({
      imageSrc: TINY_PNG,
      filterCss: 'grayscale(1)',
      content: 'hi',
      onStage: (stage) => stages.push(stage),
      onUploadProgress: (percent) => progress.push(percent),
    });

    expect(result.post.id).toBe('post-1');
    expect(result.mediaFileId).toBe('media-1');
    expect(uploadApiSpy.getPresignedUrl).toHaveBeenCalledWith(
      jasmine.objectContaining({ mimeType: jasmine.stringMatching(/image\/(jpeg|webp)/) })
    );
    expect(uploadApiSpy.uploadToStorage).toHaveBeenCalled();
    expect(uploadApiSpy.confirmUpload).toHaveBeenCalledWith(
      jasmine.objectContaining({
        fileId: 'presigned-id',
        mimeType: jasmine.stringMatching(/image\/(jpeg|webp)/),
      })
    );
    expect(postsApiSpy.createPost).toHaveBeenCalledWith({
      content: 'hi',
      mediaIds: ['media-1'],
    });
    expect(stages).toContain('baking');
    expect(stages).toContain('uploading');
    expect(stages).toContain('creating');
  });

  it('should send null content when caption is empty', async () => {
    await service.publish({ imageSrc: TINY_PNG, filterCss: '', content: '   ' });

    expect(postsApiSpy.createPost).toHaveBeenCalledWith({
      content: null,
      mediaIds: ['media-1'],
    });
  });

  it('should publish text-only posts with empty mediaIds without uploading', async () => {
    const result = await service.publish({ imageSrc: '', content: 'hello text' });

    expect(result.mediaFileId).toBeNull();
    expect(uploadApiSpy.getPresignedUrl).not.toHaveBeenCalled();
    expect(uploadApiSpy.uploadToStorage).not.toHaveBeenCalled();
    expect(uploadApiSpy.confirmUpload).not.toHaveBeenCalled();
    expect(postsApiSpy.createPost).toHaveBeenCalledWith({
      content: 'hello text',
      mediaIds: [],
    });
  });

  it('should reject empty posts with no image and no content', async () => {
    try {
      await service.publish({ content: '   ' });
      fail('expected PostPublishError');
    } catch (error) {
      expect(error).toBeInstanceOf(PostPublishError);
      expect((error as PostPublishError).stage).toBe('creating');
    }
    expect(postsApiSpy.createPost).not.toHaveBeenCalled();
  });

  it('should skip the upload and reuse the pending media id on retry', async () => {
    const result = await service.publish({
      imageSrc: TINY_PNG,
      filterCss: '',
      content: null,
      pendingMediaId: 'media-existing',
    });

    expect(result.mediaFileId).toBe('media-existing');
    expect(uploadApiSpy.getPresignedUrl).not.toHaveBeenCalled();
    expect(uploadApiSpy.uploadToStorage).not.toHaveBeenCalled();
    expect(uploadApiSpy.confirmUpload).not.toHaveBeenCalled();
    expect(postsApiSpy.createPost).toHaveBeenCalledWith({
      content: null,
      mediaIds: ['media-existing'],
    });
  });

  it('should carry the uploaded media id when post creation fails', async () => {
    postsApiSpy.createPost.and.returnValue(
      throwError(() => ({ status: 422, message: 'domain error' }))
    );

    try {
      await service.publish({
        imageSrc: TINY_PNG,
        filterCss: '',
        content: 'x',
      });
      fail('expected PostPublishError');
    } catch (error) {
      expect(error).toBeInstanceOf(PostPublishError);
      const publishError = error as PostPublishError;
      expect(publishError.stage).toBe('creating');
      expect(publishError.uploadedMediaId).toBe('media-1');
    }
  });

  it('should fail at the uploading stage without a media id when storage fails', async () => {
    uploadApiSpy.uploadToStorage.and.returnValue(
      throwError(() => new Error('network down'))
    );

    try {
      await service.publish({
        imageSrc: TINY_PNG,
        filterCss: '',
        content: null,
      });
      fail('expected PostPublishError');
    } catch (error) {
      const publishError = error as PostPublishError;
      expect(publishError.stage).toBe('uploading');
      expect(publishError.uploadedMediaId).toBeUndefined();
    }
  });

  it('should wait for the storage PUT to complete before confirming (multi-tick upload)', async () => {
    // Reproduces the 422 "File does not exist in storage": uploadToStorage
    // emits one value per progress tick, and unsubscribing early aborts the
    // XHR (teardown calls xhr.abort), so the object never lands in storage.
    let uploaded = false;
    uploadApiSpy.uploadToStorage.and.returnValue(
      new Observable<number>((observer) => {
        observer.next(30);
        const timer = setTimeout(() => {
          uploaded = true;
          observer.next(100);
          observer.complete();
        }, 10);
        // Models XHR abort on unsubscribe: early teardown cancels the PUT.
        return () => clearTimeout(timer);
      })
    );
    uploadApiSpy.confirmUpload.and.callFake(() =>
      uploaded
        ? of(MEDIA)
        : throwError(() => ({
            statusCode: 422,
            message: 'File does not exist in storage',
            error: 'Unprocessable Entity',
            code: 'INVALID_FILE',
          }))
    );

    const result = await service.publish({
      imageSrc: TINY_PNG,
      filterCss: '',
      content: null,
    });

    expect(result.post.id).toBe('post-1');
    expect(result.mediaFileId).toBe('media-1');
    expect(uploadApiSpy.confirmUpload).toHaveBeenCalled();
  });

  it('should fail at uploading without a media id when the backend confirm rejects (object missing in storage)', async () => {
    uploadApiSpy.confirmUpload.and.returnValue(
      throwError(() => ({ status: 422, message: 'object not in storage' }))
    );

    try {
      await service.publish({
        imageSrc: TINY_PNG,
        filterCss: '',
        content: null,
      });
      fail('expected PostPublishError');
    } catch (error) {
      const publishError = error as PostPublishError;
      expect(publishError.stage).toBe('uploading');
      // No MediaFile exists yet, so the retry must re-upload from scratch.
      expect(publishError.uploadedMediaId).toBeUndefined();
    }
  });
});
