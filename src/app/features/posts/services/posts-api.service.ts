import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import {
  CreatePostRequestDto,
  PaginatedPostsResponseDto,
  PostResponseDto,
} from '../models/post.dto';

/** Options for listing a user's posts. */
export interface GetUserPostsOptions {
  /** Opaque base64 cursor from the previous page's nextCursor. */
  cursor?: string | null;
  /** Number of items per page. */
  limit?: number;
}

@Injectable({
  providedIn: 'root',
})
export class PostsApiService {
  private readonly baseUrl = environment.apiBaseUrl;
  private readonly http = inject(HttpClient);

  createPost(dto: CreatePostRequestDto): Observable<PostResponseDto> {
    return this.http.post<PostResponseDto>(
      `${this.baseUrl}/api/v1/posts`,
      dto
    );
  }

  getUserPosts(
    userId: string,
    options: GetUserPostsOptions = {}
  ): Observable<PaginatedPostsResponseDto> {
    let params = new HttpParams().set('limit', options.limit ?? 20);
    if (options.cursor) {
      params = params.set('cursor', options.cursor);
    }
    return this.http.get<PaginatedPostsResponseDto>(
      `${this.baseUrl}/api/v1/users/${userId}/posts`,
      { params }
    );
  }
}
