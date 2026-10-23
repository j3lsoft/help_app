import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { PaginatedFeedResponseDto } from '../models/feed.dto';

/** Options for listing the Home Feed. */
interface GetFeedOptions {
  /** Opaque base64 cursor from the previous page's nextCursor. */
  cursor?: string | null;
  /** Number of items per page (backend caps it at 100). */
  limit?: number;
}

@Injectable({
  providedIn: 'root',
})
export class FeedApiService {
  private readonly baseUrl = environment.apiBaseUrl;
  private readonly http = inject(HttpClient);

  getFeed(options: GetFeedOptions = {}): Observable<PaginatedFeedResponseDto> {
    let params = new HttpParams().set('limit', options.limit ?? 20);
    if (options.cursor) {
      params = params.set('cursor', options.cursor);
    }
    return this.http.get<PaginatedFeedResponseDto>(
      `${this.baseUrl}/api/v1/feed`,
      { params }
    );
  }
}
