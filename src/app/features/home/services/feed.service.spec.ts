import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { FeedService } from './feed.service';
import { FeedApiService } from './feed-api.service';
import {
  FeedItemResponseDto,
  PaginatedFeedResponseDto,
} from '../models/feed.dto';

function makeFeedItem(id: string, overrides: Partial<FeedItemResponseDto> = {}): FeedItemResponseDto {
  return {
    id,
    content: `content ${id}`,
    status: 'published',
    createdAt: '2026-10-20T10:00:00Z',
    updatedAt: '2026-10-20T10:00:00Z',
    media: [
      {
        id: `m-${id}`,
        mediaFileId: `f-${id}`,
        position: 0,
        publicUrl: `https://cdn.example.com/${id}.png`,
        mimeType: 'image/png',
      },
    ],
    author: {
      id: 'u1',
      username: 'alice',
      displayName: 'Alice Sierra',
      avatarUrl: null,
    },
    ...overrides,
  };
}

function makePage(
  items: FeedItemResponseDto[],
  nextCursor: string | null = null
): PaginatedFeedResponseDto {
  return { items, nextCursor };
}

describe('FeedService', () => {
  let service: FeedService;
  let api: jasmine.SpyObj<FeedApiService>;

  beforeEach(() => {
    api = jasmine.createSpyObj('FeedApiService', ['getFeed']);
    api.getFeed.and.returnValue(of(makePage([makeFeedItem('p1')])));

    TestBed.configureTestingModule({
      providers: [{ provide: FeedApiService, useValue: api }],
    });
    service = TestBed.inject(FeedService);
  });

  it('should project feed items into view posts with the embedded author and no counters', () => {
    service.refresh().subscribe();

    const post = service.posts()[0];
    expect(post.id).toBe('p1');
    expect(post.username).toBe('alice');
    expect(post.userName).toBe('Alice Sierra');
    expect(post.aboutPost).toBe('content p1');
    expect(post.postImages).toEqual(['https://cdn.example.com/p1.png']);
    expect(post.postLikes).toBeUndefined();
    expect(post.postComments).toBeUndefined();
    expect(post.postSaves).toBeUndefined();
  });

  it('should request the first page without cursor and track the next one', () => {
    api.getFeed.and.returnValue(of(makePage([makeFeedItem('p1')], 'cursor-2')));

    service.refresh().subscribe();

    expect(api.getFeed).toHaveBeenCalledWith({ limit: 20 });
    expect(service.hasMore()).toBeTrue();

    api.getFeed.and.returnValue(of(makePage([makeFeedItem('p2')])));
    service.loadMore().subscribe();

    expect(api.getFeed).toHaveBeenCalledWith({ limit: 20, cursor: 'cursor-2' });
    expect(service.posts().map((p) => p.id)).toEqual(['p1', 'p2']);
    expect(service.hasMore()).toBeFalse();
  });

  it('should not request more pages once the cursor is exhausted', () => {
    service.refresh().subscribe();
    api.getFeed.calls.reset();

    service.loadMore().subscribe();

    expect(api.getFeed).not.toHaveBeenCalled();
  });

  it('should merge session-created posts on top and collapse duplicates', () => {
    const created = {
      id: 'mine',
      userProfilePic: '',
      userName: 'You',
      username: 'me',
      aboutPost: 'hello',
      postImages: [],
      postLike: false,
    };

    service.prependPost(created, 'u1');
    expect(service.posts()[0].id).toBe('mine');

    api.getFeed.and.returnValue(
      of(makePage([makeFeedItem('mine'), makeFeedItem('p1')]))
    );
    service.refresh().subscribe();

    expect(service.posts().map((p) => p.id)).toEqual(['mine', 'p1']);
    expect(service.createdPosts()[0].authorId).toBe('u1');
  });

  it('should toggle like and save through the engagement overlay', () => {
    service.refresh().subscribe();

    service.toggleLike('p1');
    service.toggleSave('p1');

    expect(service.posts()[0].postLike).toBeTrue();
    expect(service.posts()[0].postSaved).toBeTrue();
    const engagement = service.overrides().engagement.get('p1');
    expect(engagement?.likeDelta).toBe(1);
    expect(engagement?.saveDelta).toBe(1);

    service.toggleLike('p1');
    expect(service.posts()[0].postLike).toBeFalse();
  });

  it('should expose edited content as an overlay for other lists', () => {
    service.refresh().subscribe();

    service.updatePostContent('p1', 'patched');

    expect(service.posts()[0].aboutPost).toBe('patched');
    expect(service.overrides().contentPatches.get('p1')).toBe('patched');
  });

  it('should tombstone a removed post and restore it on rollback', () => {
    api.getFeed.and.returnValue(
      of(makePage([makeFeedItem('p1'), makeFeedItem('p2')], 'cursor-2'))
    );
    service.refresh().subscribe();

    service.removePost('p1');

    expect(service.posts().map((p) => p.id)).toEqual(['p2']);
    expect(service.overrides().removedIds.has('p1')).toBeTrue();

    service.restorePost('p1');

    expect(service.posts().map((p) => p.id)).toEqual(['p1', 'p2']);
    expect(service.overrides().removedIds.has('p1')).toBeFalse();
  });

  it('should clear the fetched pages and every mutation on reset', () => {
    service.refresh().subscribe();
    service.toggleLike('p1');
    service.updatePostContent('p1', 'patched');
    service.prependPost(
      { id: 'mine', userProfilePic: '', userName: 'You', username: 'me', aboutPost: '', postImages: [], postLike: false },
      'u1'
    );

    service.reset();

    expect(service.posts()).toEqual([]);
    expect(service.hasMore()).toBeFalse();
    expect(service.overrides().removedIds.size).toBe(0);
    expect(service.overrides().contentPatches.size).toBe(0);
    expect(service.overrides().engagement.size).toBe(0);
    expect(service.createdPosts()).toEqual([]);
  });
});
