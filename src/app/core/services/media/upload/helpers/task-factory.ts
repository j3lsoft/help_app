import {
  UploadError,
  UploadPhase,
  UploadStatus,
  UploadTask,
  UploadType,
} from '../models/upload-task.model';

export class TaskFactory {
  static createTask(
    file: File,
    strategy: 'direct' | 'presigned',
    uploadType: UploadType
  ): UploadTask {
    return {
      id: crypto.randomUUID(),
      file,
      status: UploadStatus.PENDING,
      phase: UploadPhase.REQUEST_URL,
      progress: 0,
      error: null,
      result: null,
      strategy,
      uploadType,
      createdAt: new Date(),
      startedAt: null,
      completedAt: null,
    };
  }

  static createCompletedTask(
    task: UploadTask,
    result: UploadTask['result']
  ): UploadTask {
    return {
      ...task,
      status: UploadStatus.COMPLETED,
      phase: UploadPhase.CONFIRM,
      progress: 100,
      result,
      completedAt: new Date(),
    };
  }

  static createFailedTask(task: UploadTask, error: UploadError): UploadTask {
    return {
      ...task,
      status: UploadStatus.FAILED,
      error,
    };
  }

  static createCancelledTask(task: UploadTask): UploadTask {
    return {
      ...task,
      status: UploadStatus.CANCELLED,
    };
  }

  static createRetryTask(task: UploadTask): UploadTask {
    return {
      ...task,
      status: UploadStatus.PENDING,
      phase: UploadPhase.REQUEST_URL,
      progress: 0,
      error: null,
      createdAt: new Date(),
    };
  }

  static updateTaskProgress(
    task: UploadTask,
    progress: number,
    phase?: UploadPhase
  ): UploadTask {
    return {
      ...task,
      progress,
      ...(phase && { phase }),
    };
  }

  static updateTaskPhase(
    task: UploadTask,
    phase: UploadPhase,
    progress?: number
  ): UploadTask {
    return {
      ...task,
      phase,
      ...(progress !== undefined && { progress }),
    };
  }
}
