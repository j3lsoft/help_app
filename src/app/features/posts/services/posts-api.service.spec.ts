import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { PostsApiService } from './posts-api.service';
import {
  CreatePostRequestDto,
  PaginatedPostsResponseDto,
  PostResponseDto,
} from '../models/post.dto';
import { environment } from '@env/environment';

describe('PostsApiService', () => {
  let service: PostsApiService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiBaseUrl}/api/v1`;

  const POST_DTO: PostResponseDto = {
    id: 'post-1',
    authorId: 'user-1',
    content: 'hello',
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

  const PAGE: PaginatedPostsResponseDto = {
    items: [POST_DTO],
    nextCursor: null,
    total: 1,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(PostsApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should POST the create request with content and mediaIds', () => {
    const dto: CreatePostRequestDto = {
      content: 'hello',
      mediaIds: ['media-1'],
    };

    service.createPost(dto).subscribe((result) => {
      expect(result).toEqual(POST_DTO);
    });

    const req = httpMock.expectOne(`${baseUrl}/posts`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush(POST_DTO);
  });

  it('should GET a user posts page with default limit', () => {
    service.getUserPosts('user-1').subscribe((result) => {
      expect(result).toEqual(PAGE);
    });

    const req = httpMock.expectOne(
      `${baseUrl}/users/user-1/posts?limit=20&includeTotal=true`
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('limit')).toBe('20');
    expect(req.request.params.get('includeTotal')).toBe('true');
    expect(req.request.params.has('cursor')).toBeFalse();
    req.flush(PAGE);
  });

  it('should include cursor when provided', () => {
    service
      .getUserPosts('user-1', { cursor: 'next-cursor', limit: 10 })
      .subscribe();

    const req = httpMock.expectOne(
      `${baseUrl}/users/user-1/posts?limit=10&cursor=next-cursor&includeTotal=true`
    );
    expect(req.request.params.get('cursor')).toBe('next-cursor');
    expect(req.request.params.get('limit')).toBe('10');
    expect(req.request.params.get('includeTotal')).toBe('true');
    req.flush(PAGE);
  });

  it('should omit includeTotal when explicitly disabled', () => {
    service.getUserPosts('user-1', { includeTotal: false }).subscribe();

    const req = httpMock.expectOne(`${baseUrl}/users/user-1/posts?limit=20`);
    expect(req.request.params.has('includeTotal')).toBeFalse();
    req.flush({ items: [POST_DTO], nextCursor: null });
  });
});
