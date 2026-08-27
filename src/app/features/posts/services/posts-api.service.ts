import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { CreatePostRequestDto, PostResponseDto } from '../models/post.dto';

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

  getPostsByAuthor(
    authorId: string,
    sort: 'asc' | 'desc' = 'desc'
  ): Observable<PostResponseDto[]> {
    const params = new HttpParams()
      .set('authorId', authorId)
      .set('sort', `createdAt:${sort}`);
    return this.http.get<PostResponseDto[]>(`${this.baseUrl}/api/v1/posts`, {
      params,
    });
  }
}
