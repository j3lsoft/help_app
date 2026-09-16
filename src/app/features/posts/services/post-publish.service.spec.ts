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

  const TINY_JPEG =
    'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAT8AABn/2Q==';

  function makeItem(overrides: Partial<MediaItem> = {}): MediaItem {
    return {
      id: 'item-1',
      image: { src: TINY_PNG, format: 'png', origin: 'gallery' },
      filter: '',
      edits: { ...POST_EDIT_STATE_NEUTRAL },
      pendingMediaId: null,
      ...overrides,
    };
  }

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

  it('should bake, upload via presigned flow and create the post', async () => {
    const stages: PublishStage[] = [];
    const progress: number[] = [];

    const result = await service.publish({
      items: [makeItem({ filter: 'grayscale(1)' })],
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

  it('should bake effective filter including adjust edits', async () => {
    const bakeSpy = spyOn(service, 'bakeImage').and.callThrough();
    const items: MediaItem[] = [
      {
        id: 'item-1',
        image: { src: TINY_PNG, format: 'png', origin: 'gallery' },
        filter: 'grayscale(1)',
        edits: { ...POST_EDIT_STATE_NEUTRAL, brightness: 25, contrast: 10 },
        pendingMediaId: null,
      },
    ];

    await service.publish({ items, content: 'adjusted' });

    expect(bakeSpy).toHaveBeenCalled();
    const filterArg = bakeSpy.calls.mostRecent().args[1] as string;
    expect(filterArg).toContain('grayscale(1)');
    expect(filterArg).toContain('brightness(1.25)');
    expect(filterArg).toContain('contrast(1.1)');
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
    await service.publish({ items: [makeItem()], content: '   ' });

    expect(postsApiSpy.createPost).toHaveBeenCalledWith({
      content: null,
      mediaIds: ['media-presigned-post.webp'],
    });
  });

  it('should publish text-only posts with empty mediaIds without uploading', async () => {
    const result = await service.publish({ content: 'hello text' });

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

  it('should preserve mediaIds carousel order when uploads finish out of order', async () => {
    const delaysMs = [30, 5, 20];
    let bakeIndex = 0;
    spyOn(service, 'bakeImage').and.callFake(async () => {
      const index = bakeIndex++;
      return new File([new Blob(['x'])], `post-${index}.webp`, { type: 'image/webp' });
    });
    uploadApiSpy.uploadToStorage.and.callFake((_url, file) => {
      const match = /post-(\d+)\./.exec(file.name);
      const index = match ? Number(match[1]) : 0;
      const delay = delaysMs[index] ?? 0;
      return new Observable<number>((subscriber) => {
        const timerId = setTimeout(() => {
          subscriber.next(100);
          subscriber.complete();
        }, delay);
        return () => clearTimeout(timerId);
      });
    });
    uploadApiSpy.confirmUpload.and.callFake(({ originalName }) =>
      of({ ...MEDIA, id: `media-${originalName}` })
    );

    const items: MediaItem[] = delaysMs.map((_, index) => ({
      id: `item-${index}`,
      image: { src: TINY_PNG, format: 'png', origin: 'gallery' },
      filter: '',
      edits: { ...POST_EDIT_STATE_NEUTRAL },
      pendingMediaId: null,
    }));

    const result = await service.publish({ items, content: 'ordered carousel' });

    expect(result.mediaFileIds).toEqual([
      'media-post-0.webp',
      'media-post-1.webp',
      'media-post-2.webp',
    ]);
    expect(postsApiSpy.createPost).toHaveBeenCalledWith({
      content: 'ordered carousel',
      mediaIds: result.mediaFileIds,
    });
  });

  it('should expose per-index uploadedMediaIds when a parallel upload fails', async () => {
    let bakeIndex = 0;
    spyOn(service, 'bakeImage').and.callFake(async () => {
      const index = bakeIndex++;
      return new File([new Blob(['x'])], `post-${index}.webp`, { type: 'image/webp' });
    });
    uploadApiSpy.uploadToStorage.and.callFake((_url, file) => {
      if (file.name.includes('post-1.')) {
        return throwError(() => new Error('storage failed'));
      }
      return of(100);
    });
    uploadApiSpy.confirmUpload.and.callFake(({ originalName }) =>
      of({ ...MEDIA, id: `media-${originalName}` })
    );

    const items: MediaItem[] = [0, 1, 2].map((index) => ({
      id: `item-${index}`,
      image: { src: TINY_PNG, format: 'png', origin: 'gallery' },
      filter: '',
      edits: { ...POST_EDIT_STATE_NEUTRAL },
      pendingMediaId: null,
    }));

    try {
      await service.publish({ items, content: 'partial' });
      fail('expected PostPublishError');
    } catch (error) {
      expect(error).toBeInstanceOf(PostPublishError);
      const publishError = error as PostPublishError;
      expect(publishError.stage).toBe('uploading');
      expect(publishError.uploadedMediaIds?.[0]).toBe('media-post-0.webp');
      expect(publishError.uploadedMediaIds?.[1]).toBeUndefined();
      expect(publishError.uploadedMediaIds?.[2]).toBe('media-post-2.webp');
    }
  });

  it('should carry uploadedMediaIds when post creation fails', async () => {
    postsApiSpy.createPost.and.returnValue(
      throwError(() => ({ status: 422, message: 'domain error' }))
    );

    try {
      await service.publish({ items: [makeItem()], content: 'x' });
      fail('expected PostPublishError');
    } catch (error) {
      expect(error).toBeInstanceOf(PostPublishError);
      const publishError = error as PostPublishError;
      expect(publishError.stage).toBe('creating');
      expect(publishError.uploadedMediaIds).toEqual(['media-presigned-post.webp']);
    }
  });

  it('should upload an unedited web image without re-encoding it', async () => {
    const bakeSpy = spyOn(service, 'bakeImage').and.callThrough();
    const item = makeItem({
      image: { src: TINY_JPEG, format: 'jpeg', origin: 'web' },
    });

    await service.publish({ items: [item], content: 'original' });

    expect(bakeSpy).not.toHaveBeenCalled();
    expect(uploadApiSpy.getPresignedUrl).toHaveBeenCalled();
    const presignedArg = uploadApiSpy.getPresignedUrl.calls.mostRecent()
      .args[0];
    expect(presignedArg.mimeType).toBe('image/jpeg');
  });

  it('should not mutate input items with confirmed media ids', async () => {
    const item = makeItem();

    await service.publish({ items: [item], content: 'no mutation' });

    expect(item.pendingMediaId).toBeNull();
  });

  it('should stop starting new uploads after the first failure', async () => {
    let bakeIndex = 0;
    spyOn(service, 'bakeImage').and.callFake(async () => {
      const index = bakeIndex++;
      return new File([new Blob(['x'])], `post-${index}.webp`, {
        type: 'image/webp',
      });
    });
    uploadApiSpy.uploadToStorage.and.callFake((_url, file) => {
      if (file.name.includes('post-1.')) {
        return throwError(() => new Error('storage failed'));
      }
      return of(100);
    });
    uploadApiSpy.confirmUpload.and.callFake(({ originalName }) =>
      of({ ...MEDIA, id: `media-${originalName}` })
    );

    const items = [0, 1, 2, 3, 4].map((index) =>
      makeItem({ id: `item-${index}` })
    );

    try {
      await service.publish({ items, content: 'partial' });
      fail('expected PostPublishError');
    } catch (error) {
      expect(error).toBeInstanceOf(PostPublishError);
      const publishError = error as PostPublishError;
      expect(publishError.uploadedMediaIds?.[3]).toBeUndefined();
      expect(publishError.uploadedMediaIds?.[4]).toBeUndefined();
    }

    // Only the initial concurrency window is attempted; later slots never start.
    expect(uploadApiSpy.getPresignedUrl).toHaveBeenCalledTimes(3);
  });
});
