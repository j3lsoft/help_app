import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import {
  CreatePostRequestDto,
  EditPostRequestDto,
  PaginatedPostsResponseDto,
  PostResponseDto,
} from '../models/post.dto';

/** Options for listing a user's posts. */
export interface GetUserPostsOptions {
  /** Opaque base64 cursor from the previous page's nextCursor. */
  cursor?: string | null;
  /** Number of items per page. */
  limit?: number;
  /**
   * Opt-in total count (extra COUNT query on the backend).
   * Defaults to true so profile `postsCount` reflects the real total.
   * Set to false to skip counting for perf-sensitive callers.
   */
  includeTotal?: boolean;
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

  getPostById(id: string): Observable<PostResponseDto> {
    return this.http.get<PostResponseDto>(
      `${this.baseUrl}/api/v1/posts/${id}`
    );
  }

  editPost(id: string, dto: EditPostRequestDto): Observable<PostResponseDto> {
    return this.http.put<PostResponseDto>(
      `${this.baseUrl}/api/v1/posts/${id}`,
      dto
    );
  }

  deletePost(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/v1/posts/${id}`);
  }

  getUserPosts(
    userId: string,
    options: GetUserPostsOptions = {}
  ): Observable<PaginatedPostsResponseDto> {
    let params = new HttpParams().set('limit', options.limit ?? 20);
    if (options.cursor) {
      params = params.set('cursor', options.cursor);
    }
    // Backend only returns `total` when includeTotal is set (extra COUNT query).
    // Default true to preserve the profile postsCount contract (Q2 A / Q4 B).
    if (options.includeTotal ?? true) {
      params = params.set('includeTotal', 'true');
    }
    return this.http.get<PaginatedPostsResponseDto>(
      `${this.baseUrl}/api/v1/users/${userId}/posts`,
      { params }
    );
  }
}
