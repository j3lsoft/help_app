import { Injectable, inject } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { TaskFactory } from '../helpers/task-factory';
import { UploadPhase, UploadTask } from '../models';
import { UploadApiService } from '../services/upload-api.service';
import { BaseUploadDriver } from './base-upload.driver';

@Injectable({ providedIn: 'root' })
export class DirectDriver extends BaseUploadDriver {
  private readonly api = inject(UploadApiService);

  upload(task: UploadTask): Observable<UploadTask> {
    return new Observable((observer: Observer<UploadTask>) => {
      const controller = this.setupAbortController(task.id, observer);
      let currentTask = this.createInitialTask(task);

      observer.next(currentTask);

      const sub = this.executeWithRetry(
        this.api.uploadDirect(
          task.file,
          (percent) => {
            if (controller.signal.aborted) return;
            currentTask = TaskFactory.updateTaskProgress(
              currentTask,
              percent,
              UploadPhase.UPLOAD
            );
            observer.next(currentTask);
          },
          controller.signal
        ),
        task,
        'direct upload',
        'DIRECT_UPLOAD_FAILED'
      ).subscribe({
        next: (response) => {
          const result = this.mapResult(response);
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
}
