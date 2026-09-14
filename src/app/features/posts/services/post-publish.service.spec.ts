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
import { MediaItem, POST_EDIT_STATE_NEUTRAL } from '../models/post-creation.model';

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

    uploadApiSpy.getPresignedUrl.and.callFake(({ originalName }) =>
      of({ id: `presigned-${originalName}`, key: `uploads/${originalName}`, uploadUrl: 'https://s3/put' })
    );
    uploadApiSpy.uploadToStorage.and.returnValue(of(100));
    uploadApiSpy.confirmUpload.and.callFake(({ fileId }) =>
      of({ ...MEDIA, id: `media-${fileId}` })
    );
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

  it('should bake, upload via presigned flow and create the post (single legacy param)', async () => {
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
    expect(result.mediaFileId).toBe('media-presigned-post.webp');
    expect(result.mediaFileIds).toEqual(['media-presigned-post.webp']);
    expect(uploadApiSpy.getPresignedUrl).toHaveBeenCalled();
    expect(uploadApiSpy.uploadToStorage).toHaveBeenCalled();
    expect(uploadApiSpy.confirmUpload).toHaveBeenCalled();
    expect(postsApiSpy.createPost).toHaveBeenCalledWith({
      content: 'hi',
      mediaIds: ['media-presigned-post.webp'],
    });
    expect(stages).toContain('baking');
    expect(stages).toContain('uploading');
    expect(stages).toContain('creating');
  });

  it('should publish multiple MediaItem items in sequence', async () => {
    const items: MediaItem[] = [
      {
        id: 'item-1',
        image: { src: TINY_PNG, format: 'png', origin: 'gallery' },
        filter: '',
        edits: { ...POST_EDIT_STATE_NEUTRAL },
        pendingMediaId: null,
      },
      {
        id: 'item-2',
        image: { src: TINY_PNG, format: 'png', origin: 'gallery' },
        filter: 'sepia(1)',
        edits: { ...POST_EDIT_STATE_NEUTRAL, rotate: 1 },
        pendingMediaId: null,
      },
    ];

    const result = await service.publish({
      items,
      content: 'multi image post',
    });

    expect(result.mediaFileIds.length).toBe(2);
    expect(uploadApiSpy.getPresignedUrl).toHaveBeenCalledTimes(2);
    expect(postsApiSpy.createPost).toHaveBeenCalledWith({
      content: 'multi image post',
      mediaIds: result.mediaFileIds,
    });
  });

  it('should send null content when caption is empty', async () => {
    await service.publish({ imageSrc: TINY_PNG, filterCss: '', content: '   ' });

    expect(postsApiSpy.createPost).toHaveBeenCalledWith({
      content: null,
      mediaIds: ['media-presigned-post.webp'],
    });
  });

  it('should publish text-only posts with empty mediaIds without uploading', async () => {
    const result = await service.publish({ imageSrc: '', content: 'hello text' });

    expect(result.mediaFileId).toBeNull();
    expect(result.mediaFileIds).toEqual([]);
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

  it('should skip upload and reuse pendingMediaId on retry for items', async () => {
    const items: MediaItem[] = [
      {
        id: 'item-1',
        image: { src: TINY_PNG, format: 'png', origin: 'gallery' },
        filter: '',
        edits: { ...POST_EDIT_STATE_NEUTRAL },
        pendingMediaId: 'confirmed-media-1',
      },
    ];

    const result = await service.publish({
      items,
      content: 'retry post',
    });

    expect(result.mediaFileIds).toEqual(['confirmed-media-1']);
    expect(uploadApiSpy.getPresignedUrl).not.toHaveBeenCalled();
  });

  it('should carry uploadedMediaIds when post creation fails', async () => {
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
      expect(publishError.uploadedMediaIds).toEqual(['media-presigned-post.webp']);
    }
  });
});
