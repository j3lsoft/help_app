import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { PostsApiService } from './posts-api.service';
import { CreatePostRequestDto, PostResponseDto } from '../models/post.dto';
import { environment } from '@env/environment';

describe('PostsApiService', () => {
  let service: PostsApiService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiBaseUrl}/api/v1/posts`;

  const POST_DTO: PostResponseDto = {
    id: 'post-1',
    authorId: 'user-1',
    content: 'hello',
    media: [{ id: 'ref-1', mediaFileId: 'media-1', position: 0 }],
    status: 'published',
    createdAt: '2026-08-25T00:00:00Z',
    updatedAt: '2026-08-25T00:00:00Z',
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

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush(POST_DTO);
  });

  it('should allow creating a post without content (image only)', () => {
    const dto: CreatePostRequestDto = { content: null, mediaIds: ['media-1'] };

    service.createPost(dto).subscribe();

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush(POST_DTO);
  });
});
