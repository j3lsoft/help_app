import { inject, Injectable } from '@angular/core';
import { Observable, retry, timer } from 'rxjs';
import { LoggerService } from '../../../logger.service';
import { UPLOAD_CONFIG } from '../upload.token';

@Injectable({ providedIn: 'root' })
export class UploadRetryStrategy {
  private readonly logger = inject(LoggerService);
  private readonly config = inject(UPLOAD_CONFIG);

  execute<T>(
    source: Observable<T>,
    task: { id: string },
    operation: string
  ): Observable<T> {
    return source.pipe(
      retry({
        count: this.config.retryAttempts,
        delay: (error, retryCount) => {
          // If error explicitly says it's not retryable, bail out
          if (error && error.retryable === false) {
            throw error;
          }

          this.logger.warn(
            `Retry ${operation} attempt ${retryCount} for task ${task.id}`
          );
          // Exponential backoff
          return timer(Math.pow(2, retryCount) * this.config.retryDelay);
        },
      })
    );
  }
}
