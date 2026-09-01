import { of, throwError } from 'rxjs';
import { AppError } from '@core/models/app-error.model';
import { LoggerService } from '@core/services/logger.service';
import { PaginatedPostsResponseDto } from '@features/posts/models/post.dto';
import { createProfilePostsLoader } from './profile-posts.loader';

describe('createProfilePostsLoader', () => {
  let loggerSpy: jasmine.SpyObj<LoggerService>;
  let fetchSpy: jasmine.Spy;

  const PAGE_1: PaginatedPostsResponseDto = {
    items: [
      {
        id: 'p1',
        authorId: 'u1',
        content: 'hi',
        media: [
          {
            id: 'm1',
            mediaFileId: 'file-1',
            position: 0,
            publicUrl: 'https://cdn.example.com/p1.jpg',
            mimeType: 'image/jpeg',
          },
        ],
        status: 'published',
        createdAt: '2026-08-25T00:00:00Z',
        updatedAt: '2026-08-25T00:00:00Z',
      },
    ],
    nextCursor: 'page-2',
    total: 5,
  };

  const PAGE_2: PaginatedPostsResponseDto = {
    items: [
      {
        id: 'p2',
        authorId: 'u1',
        content: 'hello again',
        media: [],
        status: 'published',
        createdAt: '2026-08-24T00:00:00Z',
        updatedAt: '2026-08-24T00:00:00Z',
      },
    ],
    nextCursor: null,
    total: 5,
  };

  beforeEach(() => {
    loggerSpy = jasmine.createSpyObj('LoggerService', [
      'error',
      'debug',
      'info',
      'warn',
    ]);
    fetchSpy = jasmine.createSpy('fetchPage');
  });

  it('should load the first page and expose posts, total and count', () => {
    fetchSpy.and.returnValue(of(PAGE_1));
    const loader = createProfilePostsLoader({
      fetchPage: fetchSpy,
      logger: loggerSpy,
    });

    loader.loadFirst('u1');

    expect(loader.posts().length).toBe(1);
    expect(loader.posts()[0].image).toBe('https://cdn.example.com/p1.jpg');
    expect(loader.postsCount()).toBe('5');
    expect(loader.hasMore()).toBeTrue();
    expect(loader.notFound()).toBeFalse();
    expect(fetchSpy).toHaveBeenCalledWith('u1', undefined);
  });

  it('should append the next page on loadMore', () => {
    fetchSpy.and.callFake((_userId: string, cursor?: string | null) =>
      cursor ? of(PAGE_2) : of(PAGE_1),
    );
    const loader = createProfilePostsLoader({
      fetchPage: fetchSpy,
      logger: loggerSpy,
    });

    loader.loadFirst('u1');
    loader.loadMore('u1');

    expect(loader.posts().length).toBe(2);
    expect(loader.posts()[1].id).toBe('p2');
    expect(loader.hasMore()).toBeFalse();
  });

  it('should reset and retry once when the first page fails with 422', () => {
    let calls = 0;
    fetchSpy.and.callFake(() => {
      calls += 1;
      if (calls === 1) {
        return throwError(() => ({ status: 422, handled: false } as AppError));
      }
      return of(PAGE_1);
    });
    const loader = createProfilePostsLoader({
      fetchPage: fetchSpy,
      logger: loggerSpy,
    });

    loader.loadFirst('u1');

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(loader.posts().length).toBe(1);
    expect(loader.notFound()).toBeFalse();
  });

  it('should surface a 404 as not found', () => {
    fetchSpy.and.returnValue(
      throwError(() => ({ status: 404, handled: false } as AppError)),
    );
    const loader = createProfilePostsLoader({
      fetchPage: fetchSpy,
      logger: loggerSpy,
    });

    loader.loadFirst('u1');

    expect(loader.posts().length).toBe(0);
    expect(loader.notFound()).toBeTrue();
  });

  it('should reset state when loading a different user', () => {
    fetchSpy.and.callFake(() => of(PAGE_1));
    const loader = createProfilePostsLoader({
      fetchPage: fetchSpy,
      logger: loggerSpy,
    });

    loader.loadFirst('u1');
    loader.loadFirst('u2');

    expect(loader.posts().length).toBe(1);
    expect(loader.posts()[0].id).toBe('p1');
  });
});