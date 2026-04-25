import { Injectable, inject } from '@angular/core';
import {
  Observable,
  Observer,
  concat,
  defer,
  ignoreElements,
  map,
  switchMap,
  tap,
} from 'rxjs';
import { UploadProgressCalculator } from '../helpers/progress-calculator';
import { TaskFactory } from '../helpers/task-factory';
import {
  MediaFileResponseDto,
  PresignedUrlResponseDto,
  UploadPhase,
  UploadTask,
} from '../models';
import { UploadApiService } from '../services/upload-api.service';
import { BaseUploadDriver } from './base-upload.driver';

@Injectable({ providedIn: 'root' })
export class PresignedDriver extends BaseUploadDriver {
  private readonly api = inject(UploadApiService);

  upload(task: UploadTask): Observable<UploadTask> {
    return new Observable((observer: Observer<UploadTask>) => {
      const controller = this.setupAbortController(task.id, observer);
      let currentTask = this.createInitialTask(task);

      observer.next(currentTask);

      const sub = this.requestPresignedUrl(currentTask)
        .pipe(
          switchMap((presigned) => {
            // Update to UPLOAD phase
            currentTask = TaskFactory.updateTaskPhase(
              currentTask,
              UploadPhase.UPLOAD,
              UploadProgressCalculator.getPhaseCompletionProgress(
                UploadPhase.REQUEST_URL
              )
            );
            observer.next(currentTask);

            // 1. Upload to storage (emits progress numbers)
            const storageUpload$ = this.uploadToStorage(
              presigned,
              currentTask,
              controller
            ).pipe(
              tap((progress: number) => {
                currentTask = TaskFactory.updateTaskProgress(
                  currentTask,
                  progress
                );
                observer.next(currentTask);
              }),
              // We only care about progress via tap, don't emit values to next step (concat)
              ignoreElements()
            );

            // 2. Confirm upload (starts after storageUpload$ completes)
            const confirmation$ = defer(() => {
              currentTask = TaskFactory.updateTaskPhase(
                currentTask,
                UploadPhase.PROCESSING,
                UploadProgressCalculator.getPhaseCompletionProgress(
                  UploadPhase.UPLOAD
                )
              );
              observer.next(currentTask);

              return this.confirmUpload(presigned, currentTask);
            });

            return concat(storageUpload$, confirmation$);
          })
        )
        .subscribe({
          next: (response) => {
            const result = this.mapResult(response as MediaFileResponseDto);
            currentTask = TaskFactory.createCompletedTask(currentTask, result);

            this.cleanupController(task.id);
            observer.next(currentTask);
            observer.complete();
          },
          error: (err) => {
            this.cleanupController(task.id);
            observer.error(err);
          },
        });

      return () => {
        sub.unsubscribe();
        this.cancel(task.id);
      };
    });
  }

  private requestPresignedUrl(
    currentTask: UploadTask
  ): Observable<PresignedUrlResponseDto> {
    return this.executeWithRetry(
      this.api.getPresignedUrl({
        mimeType: currentTask.file.type,
        originalName: currentTask.file.name,
        size: currentTask.file.size,
      }),
      currentTask,
      'presigned URL request',
      'PRESIGNED_URL_FAILED'
    );
  }

  private uploadToStorage(
    presigned: PresignedUrlResponseDto,
    currentTask: UploadTask,
    controller: AbortController
  ): Observable<number> {
    return this.executeWithRetry(
      this.api
        .uploadToStorage(
          presigned.uploadUrl,
          currentTask.file,
          undefined,
          controller.signal
        )
        .pipe(
          map((percent) =>
            UploadProgressCalculator.calculate(
              UploadPhase.UPLOAD,
              percent / 100
            )
          )
        ),
      currentTask,
      'storage upload',
      'STORAGE_UPLOAD_FAILED'
    );
  }

  private confirmUpload(
    presigned: PresignedUrlResponseDto,
    currentTask: UploadTask
  ): Observable<MediaFileResponseDto> {
    return this.executeWithRetry(
      this.api.confirmUpload({
        fileId: presigned.id,
        key: presigned.key,
        mimeType: currentTask.file.type,
        originalName: currentTask.file.name,
        size: currentTask.file.size,
      }),
      currentTask,
      'upload confirmation',
      'CONFIRMATION_FAILED'
    );
  }
}
