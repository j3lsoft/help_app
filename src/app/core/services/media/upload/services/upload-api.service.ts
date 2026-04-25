import {
  HttpClient,
  HttpEvent,
  HttpEventType,
  HttpRequest,
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@env/environment';
import { Observable, filter, map } from 'rxjs';
import { LoggerService } from '../../../logger.service';
import {
  ConfirmUploadDto,
  DeleteMediaResponseDto,
  GeneratePresignedUrlDto,
  MediaFileResponseDto,
  PresignedUrlResponseDto,
} from '../models';

@Injectable({ providedIn: 'root' })
export class UploadApiService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/media`;
  private readonly http = inject(HttpClient);
  private readonly logger = inject(LoggerService);

  uploadDirect(
    file: File,
    onProgress?: (percent: number) => void,
    signal?: AbortSignal
  ): Observable<MediaFileResponseDto> {
    const formData = new FormData();
    formData.append('file', file);

    const req = new HttpRequest('POST', `${this.baseUrl}/upload`, formData, {
      reportProgress: true,
      responseType: 'json',
    });

    return this.http.request(req).pipe(
      filter(
        (event): event is HttpEvent<MediaFileResponseDto> =>
          event.type === HttpEventType.UploadProgress ||
          event.type === HttpEventType.Response
      ),
      map((event) => {
        if (
          event.type === HttpEventType.UploadProgress &&
          onProgress &&
          event.total
        ) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
        if (event.type === HttpEventType.Response) {
          return event.body as MediaFileResponseDto;
        }
        throw new Error('Unexpected event type');
      })
    );
  }

  getPresignedUrl(
    dto: GeneratePresignedUrlDto
  ): Observable<PresignedUrlResponseDto> {
    return this.http.post<PresignedUrlResponseDto>(
      `${this.baseUrl}/presigned-url`,
      dto
    );
  }

  confirmUpload(dto: ConfirmUploadDto): Observable<MediaFileResponseDto> {
    return this.http.post<MediaFileResponseDto>(
      `${this.baseUrl}/upload/confirm`,
      dto
    );
  }

  uploadToStorage(
    url: string,
    file: File,
    onProgress?: (percent: number) => void,
    signal?: AbortSignal
  ): Observable<number> {
    return new Observable((observer) => {
      this.logger.debug('Starting uploadToStorage', {
        context: 'UploadApiService',
        data: {
          url: url.substring(0, 100) + '...',
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
        },
      });

      const xhr = new XMLHttpRequest();

      const cleanup = () => {
        xhr.upload.onprogress = null;
        xhr.onload = null;
        xhr.onerror = null;
        xhr.onabort = null;
      };

      const abortHandler = () => {
        xhr.abort();
      };

      if (signal) {
        signal.addEventListener('abort', abortHandler);
      }

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
          observer.next(percent);
        }
      };

      xhr.onload = () => {
        cleanup();
        if (xhr.status >= 200 && xhr.status < 300) {
          observer.next(100);
          observer.complete();
        } else {
          const errorMsg = `Upload failed with status ${xhr.status}: ${xhr.statusText}. Response: ${xhr.responseText}`;
          this.logger.error(errorMsg);
          observer.error(new Error(errorMsg));
        }
      };

      xhr.onerror = () => {
        cleanup();
        const errorMsg = `Upload failed - Network error. Status: ${xhr.status}, Response: ${xhr.responseText}`;
        this.logger.error(errorMsg);
        observer.error(new Error(errorMsg));
      };

      xhr.onabort = () => {
        cleanup();
        observer.error(new Error('Upload aborted'));
      };

      xhr.open('PUT', url);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);

      return () => {
        cleanup();
        if (signal) {
          signal.removeEventListener('abort', abortHandler);
        }
        xhr.abort();
      };
    });
  }

  deleteFile(fileId: string): Observable<DeleteMediaResponseDto> {
    return this.http.delete<DeleteMediaResponseDto>(
      `${this.baseUrl}/${fileId}`
    );
  }
}
