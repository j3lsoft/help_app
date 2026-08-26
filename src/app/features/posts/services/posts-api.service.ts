import { HttpClient } from '@angular/common/http';
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
}
