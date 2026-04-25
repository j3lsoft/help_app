import { computed, inject, Injectable, OnDestroy, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { LoggerService } from '../../../logger.service';
import { DirectDriver, PresignedDriver } from '../drivers';
import { UploadDriver } from '../drivers/upload-driver.interface';
import { TaskFactory } from '../helpers/task-factory';
import { UploadError, UploadStatus, UploadTask, UploadType } from '../models';
import { UPLOAD_CONFIG } from '../upload.token';

@Injectable({ providedIn: 'root' })
export class UploadFacade implements OnDestroy {
  private readonly directDriver = inject(DirectDriver);
  private readonly presignedDriver = inject(PresignedDriver);
  private readonly logger = inject(LoggerService);
  private readonly config = inject(UPLOAD_CONFIG);

  private tasksMap = signal<Map<string, UploadTask>>(new Map());
  private subscriptions = new Map<string, Subscription>();

  private selectedStrategy = signal<'direct' | 'presigned'>(
    this.config.strategy as 'direct' | 'presigned'
  );
  private selectedUploadType = signal<UploadType>('generic');

  private getDriver(strategy: 'direct' | 'presigned'): UploadDriver {
    return strategy === 'presigned' ? this.presignedDriver : this.directDriver;
  }

  readonly queue = computed(() => Array.from(this.tasksMap().values()));
  readonly activeUploads = computed(() =>
    this.queue().filter(
      (t) =>
        t.status === UploadStatus.UPLOADING ||
        t.status === UploadStatus.PROCESSING
    )
  );
  readonly pendingUploads = computed(() =>
    this.queue().filter((t) => t.status === UploadStatus.PENDING)
  );
  readonly completedUploads = computed(() =>
    this.queue().filter((t) => t.status === UploadStatus.COMPLETED)
  );
  readonly failedUploads = computed(() =>
    this.queue().filter((t) => t.status === UploadStatus.FAILED)
  );
  readonly hasActiveUploads = computed(() => this.activeUploads().length > 0);

  readonly totalProgress = computed(() => {
    const active = this.activeUploads();
    if (active.length === 0) return 0;
    return Math.round(
      active.reduce((sum, t) => sum + t.progress, 0) / active.length
    );
  });

  readonly strategy = this.selectedStrategy.asReadonly();
  readonly uploadType = this.selectedUploadType.asReadonly();

  setStrategy(strategy: 'direct' | 'presigned'): void {
    this.selectedStrategy.set(strategy);
  }

  setUploadType(type: UploadType): void {
    this.selectedUploadType.set(type);
  }

  addFiles(files: FileList | File[]): string[] {
    return this.processFiles(Array.from(files));
  }

  addFile(file: File): string | null {
    const result = this.processFiles([file]);
    return result.length > 0 ? result[0] : null;
  }

  private processFiles(files: File[]): string[] {
    const taskIds: string[] = [];

    for (const file of files) {
      const validation = this.validateFile(file);
      if (validation.valid) {
        const task = TaskFactory.createTask(
          file,
          this.selectedStrategy(),
          this.selectedUploadType()
        );
        taskIds.push(task.id);
        this.updateTask(task);
      } else {
        this.logger.warn(`Invalid file: ${file.name}: ${validation.error}`);
      }
    }

    this.processQueue();
    return taskIds;
  }

  private validateFile(file: File): { valid: boolean; error?: string } {
    // Size validation
    if (file.size > this.config.maxFileSize) {
      return {
        valid: false,
        error: `File too large. Max: ${
          this.config.maxFileSize / 1024 / 1024
        }MB`,
      };
    }

    // MIME type validation
    if (!this.config.allowedMimeTypes.includes(file.type)) {
      return { valid: false, error: 'File type not allowed' };
    }

    // Extension validation
    if (this.config.allowedExtensions?.length) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!ext || !this.config.allowedExtensions.includes(ext)) {
        return {
          valid: false,
          error: `Extension .${ext} not allowed. Allowed: ${this.config.allowedExtensions.join(
            ', '
          )}`,
        };
      }
    }

    return { valid: true };
  }

  processQueue(): void {
    const active = this.activeUploads();
    const max = this.config.maxConcurrentUploads;
    const availableSlots = max - active.length;

    if (availableSlots <= 0) return;

    const pending = this.pendingUploads();
    if (pending.length === 0) return;

    const tasksToStart = pending.slice(0, availableSlots);
    tasksToStart.forEach((task: UploadTask) => this.startUpload(task));
  }

  private startUpload(task: UploadTask): void {
    const currentTask = this.getTask(task.id);
    if (!currentTask || currentTask.status !== UploadStatus.PENDING) {
      return;
    }

    this.updateTask({
      ...currentTask,
      status: UploadStatus.UPLOADING,
      startedAt: new Date(),
    });

    const subscription = this.getDriver(task.strategy)
      .upload(task)
      .subscribe({
        next: (updatedTask) => {
          this.updateTask(updatedTask);
          if (updatedTask.status === UploadStatus.COMPLETED) {
            this.onUploadComplete(updatedTask.id);
          }
        },
        error: (error: UploadError) => {
          this.onUploadError(task.id, error);
        },
      });

    this.subscriptions.set(task.id, subscription);
  }

  private onUploadComplete(taskId: string): void {
    this.cleanupTaskResources(taskId);
    this.processQueue();
  }

  private onUploadError(taskId: string, error: UploadError): void {
    const task = this.getTask(taskId);
    if (task) {
      this.updateTask(TaskFactory.createFailedTask(task, error));
    }
    this.cleanupTaskResources(taskId);
    this.processQueue();
  }

  private cleanupTaskResources(taskId: string): void {
    const sub = this.subscriptions.get(taskId);
    if (sub) {
      sub.unsubscribe();
      this.subscriptions.delete(taskId);
    }
  }

  private updateTask(task: UploadTask): void {
    this.tasksMap.update((map) => {
      const newMap = new Map(map);
      newMap.set(task.id, task);
      return newMap;
    });
  }

  getTask(taskId: string): UploadTask | undefined {
    return this.tasksMap().get(taskId);
  }

  cancelUpload(taskId: string): void {
    const task = this.getTask(taskId);
    if (task) {
      this.cleanupTaskResources(taskId);
      this.getDriver(task.strategy).cancel(taskId);
      this.updateTask(TaskFactory.createCancelledTask(task));
      this.processQueue();
    }
  }

  retryUpload(taskId: string): void {
    const task = this.getTask(taskId);
    if (task && task.status === UploadStatus.FAILED) {
      const newTask = TaskFactory.createRetryTask(task);
      this.updateTask(newTask);
      this.processQueue();
    }
  }

  clearCompleted(): void {
    this.tasksMap.update((map) => {
      const newMap = new Map(map);
      for (const [id, task] of newMap) {
        if (
          task.status === UploadStatus.COMPLETED ||
          task.status === UploadStatus.CANCELLED
        ) {
          this.cleanupTaskResources(id);
          newMap.delete(id);
        }
      }
      return newMap;
    });
  }

  clearAll(): void {
    // Teardown all resources first
    for (const taskId of this.tasksMap().keys()) {
      this.cleanupTaskResources(taskId);
      const task = this.getTask(taskId);
      if (task) {
        this.getDriver(task.strategy).cancel(taskId);
      }
    }
    this.tasksMap.set(new Map());
  }

  ngOnDestroy(): void {
    this.clearAll();
  }
}
