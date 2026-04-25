import { Observable } from 'rxjs';
import { UploadTask } from '../models';

export interface UploadDriver {
  upload(task: UploadTask): Observable<UploadTask>;
  cancel(taskId: string): void;
}
