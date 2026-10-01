import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { LoggerService } from '@core/services/logger.service';
import { MediaUpload } from '@core/services/media/upload/services/media-upload.service';
import { UploadResult } from '@core/services/media/upload/models';
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
  let mediaUploadSpy: jasmine.SpyObj<MediaUpload>;
  let postsApiSpy: jasmine.SpyObj<PostsApiService>;

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

  function confirmedResult(file: File): UploadResult {
    return {
      id: `media-${file.name}`,
      key: `uploads/${file.name}`,
      publicUrl: `https://storage.example.com/uploads/${file.name}`,
      mimeType: file.type,
      size: file.size,
      ownerId: 'user-1',
    };
  }

  /** Stubs the rasterizer to produce deterministic file names. */
  function stubBake(): jasmine.Spy<PostPublishService['bakeImage']> {
    let index = 0;
    return spyOn(service, 'bakeImage').and.callFake(async () =>
      new File(['x'], `post-${index++}.webp`, { type: 'image/webp' }),
    );
  }

  beforeEach(() => {
    mediaUploadSpy = jasmine.createSpyObj<MediaUpload>('MediaUpload', [
      'upload',
      'remove',
    ]);
    mediaUploadSpy.upload.and.callFake(async (file: File) =>
      confirmedResult(file),
    );
    postsApiSpy = jasmine.createSpyObj('PostsApiService', ['createPost']);
    postsApiSpy.createPost.and.returnValue(of(POST_DTO));

    TestBed.configureTestingModule({
      providers: [
        PostPublishService,
        { provide: MediaUpload, useValue: mediaUploadSpy },
        { provide: PostsApiService, useValue: postsApiSpy },
      ],
    });
    service = TestBed.inject(PostPublishService);
    TestBed.inject(LoggerService);
  });

  it('should bake, upload through MediaUpload and create the post', async () => {
    spyOn(service, 'bakeImage').and.resolveTo(
      new File(['x'], 'post.webp', { type: 'image/webp' }),
    );
    const stages: PublishStage[] = [];
    const progress: number[] = [];

    const result = await service.publish({
      items: [makeItem({ filter: 'grayscale(1)' })],
      content: 'hi',
      onStage: (stage) => stages.push(stage),
      onUploadProgress: (percent) => progress.push(percent),
    });

    expect(result.post.id).toBe('post-1');
    expect(result.mediaFileId).toBe('media-post.webp');
    expect(result.mediaFileIds).toEqual(['media-post.webp']);
    expect(mediaUploadSpy.upload).toHaveBeenCalled();
    const uploadArg = mediaUploadSpy.upload.calls.mostRecent().args;
    expect(uploadArg[1]).toEqual(
      jasmine.objectContaining({ uploadType: 'post_image' }),
    );
    expect(postsApiSpy.createPost).toHaveBeenCalledWith({
      content: 'hi',
      mediaIds: ['media-post.webp'],
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

  it('should upload every MediaItem in the batch', async () => {
    stubBake();
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
    expect(mediaUploadSpy.upload).toHaveBeenCalledTimes(2);
    expect(postsApiSpy.createPost).toHaveBeenCalledWith({
      content: 'multi image post',
      mediaIds: result.mediaFileIds,
    });
  });

  it('should send null content when caption is empty', async () => {
    stubBake();
    await service.publish({ items: [makeItem()], content: '   ' });

    expect(postsApiSpy.createPost).toHaveBeenCalledWith({
      content: null,
      mediaIds: ['media-post-0.webp'],
    });
  });

  it('should publish text-only posts with empty mediaIds without uploading', async () => {
    const result = await service.publish({ content: 'hello text' });

    expect(result.mediaFileId).toBeNull();
    expect(result.mediaFileIds).toEqual([]);
    expect(mediaUploadSpy.upload).not.toHaveBeenCalled();
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
    expect(mediaUploadSpy.upload).not.toHaveBeenCalled();
  });

  it('should preserve mediaIds carousel order when uploads finish out of order', async () => {
    const delaysMs = [30, 5, 20];
    stubBake();
    mediaUploadSpy.upload.and.callFake((file: File) => {
      const match = /post-(\d+)\./.exec(file.name);
      const index = match ? Number(match[1]) : 0;
      const delay = delaysMs[index] ?? 0;
      return new Promise<UploadResult>((resolve) => {
        setTimeout(() => resolve(confirmedResult(file)), delay);
      });
    });

    const items: MediaItem[] = delaysMs.map((_, index) =>
      makeItem({ id: `item-${index}` }),
    );

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
    stubBake();
    mediaUploadSpy.upload.and.callFake((file: File) => {
      if (file.name.includes('post-1.')) {
        return Promise.reject(new Error('storage failed'));
      }
      return Promise.resolve(confirmedResult(file));
    });

    const items: MediaItem[] = [0, 1, 2].map((index) =>
      makeItem({ id: `item-${index}` }),
    );

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
    spyOn(service, 'bakeImage').and.resolveTo(
      new File(['x'], 'post.webp', { type: 'image/webp' }),
    );
    postsApiSpy.createPost.and.returnValue(
      throwError(() => ({ status: 422, message: 'domain error' })),
    );

    try {
      await service.publish({ items: [makeItem()], content: 'x' });
      fail('expected PostPublishError');
    } catch (error) {
      expect(error).toBeInstanceOf(PostPublishError);
      const publishError = error as PostPublishError;
      expect(publishError.stage).toBe('creating');
      expect(publishError.uploadedMediaIds).toEqual(['media-post.webp']);
    }
  });

  it('should upload an unedited web image without re-encoding it', async () => {
    const bakeSpy = spyOn(service, 'bakeImage').and.callThrough();
    const item = makeItem({
      image: { src: TINY_JPEG, format: 'jpeg', origin: 'web' },
    });

    await service.publish({ items: [item], content: 'original' });

    expect(bakeSpy).not.toHaveBeenCalled();
    expect(mediaUploadSpy.upload).toHaveBeenCalled();
    const uploadedFile = mediaUploadSpy.upload.calls.mostRecent().args[0];
    expect(uploadedFile.type).toBe('image/jpeg');
  });

  it('should not mutate input items with confirmed media ids', async () => {
    stubBake();
    const item = makeItem();

    await service.publish({ items: [item], content: 'no mutation' });

    expect(item.pendingMediaId).toBeNull();
  });

  it('should stop starting new uploads after the first failure', async () => {
    stubBake();
    // The failing file rejects immediately while the in-flight successes settle
    // later, so a worker cannot grab a new slot before the first error is set.
    mediaUploadSpy.upload.and.callFake((file: File) => {
      if (file.name.includes('post-1.')) {
        return Promise.reject(new Error('storage failed'));
      }
      return new Promise<UploadResult>((resolve) =>
        setTimeout(() => resolve(confirmedResult(file)), 5),
      );
    });

    const items = [0, 1, 2, 3, 4].map((index) =>
      makeItem({ id: `item-${index}` }),
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
    expect(mediaUploadSpy.upload).toHaveBeenCalledTimes(3);
  });
});
