import { Injectable, inject } from '@angular/core';
import { Observable, Observer, catchError } from 'rxjs';
import { LoggerService } from '../../../logger.service';
import {
  MediaFileResponseDto,
  UploadError,
  UploadPhase,
  UploadResult,
  UploadStatus,
  UploadTask,
} from '../models';
import { UploadDriver } from './upload-driver.interface';

import { UploadRetryStrategy } from './upload-retry.strategy';

@Injectable({ providedIn: 'root' })
export abstract class BaseUploadDriver implements UploadDriver {
  protected readonly logger = inject(LoggerService);
  protected readonly retryStrategy = inject(UploadRetryStrategy);
  protected readonly controllers = new Map<string, AbortController>();

  abstract upload(task: UploadTask): Observable<UploadTask>;

  cancel(taskId: string): void {
    const controller = this.controllers.get(taskId);
    if (controller) {
      controller.abort();
      this.controllers.delete(taskId);
    }
  }

  protected createInitialTask(task: UploadTask): UploadTask {
    return {
      ...task,
      status: UploadStatus.UPLOADING,
      phase: UploadPhase.REQUEST_URL,
      progress: 0,
      startedAt: new Date(),
    };
  }

  protected mapResult(dto: MediaFileResponseDto): UploadResult {
    return {
      id: dto.id,
      key: dto.key,
      publicUrl: dto.publicUrl,
      mimeType: dto.mimeType,
      size: dto.size,
      ownerId: dto.ownerId,
    };
  }

  protected mapError(
    error: any,
    defaultCode: string = 'UPLOAD_FAILED'
  ): UploadError {
    const statusCode = error.status || 0;
    return {
      code: error.code || defaultCode,
      message: error.message || 'Upload failed',
      retryable: statusCode !== 401 && statusCode !== 403,
      statusCode,
    };
  }

  protected executeWithRetry<T>(
    source: Observable<T>,
    task: UploadTask,
    operation: string,
    errorCode: string = 'UPLOAD_FAILED'
  ): Observable<T> {
    return this.retryStrategy.execute(
      source.pipe(
        catchError((error) => {
          const uploadError = this.mapError(error, errorCode);
          throw uploadError;
        })
      ),
      task,
      operation
    );
  }

  protected setupAbortController(
    taskId: string,
    observer: Observer<UploadTask>
  ): AbortController {
    const controller = new AbortController();
    this.controllers.set(taskId, controller);

    controller.signal.addEventListener('abort', () => {
      this.controllers.delete(taskId);
      observer.error(new Error('Upload aborted'));
    });

    return controller;
  }

  protected cleanupController(taskId: string): void {
    this.controllers.delete(taskId);
  }
}
