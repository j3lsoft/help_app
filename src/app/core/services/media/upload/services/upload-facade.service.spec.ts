import { TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { DirectDriver, PresignedDriver } from '../drivers';
import { TaskFactory } from '../helpers/task-factory';
import { UploadConfig } from '../models/upload-config.model';
import { UPLOAD_CONFIG } from '../upload.token';
import { UploadFacade } from './upload-facade.service';

const TEST_UPLOAD_CONFIG: UploadConfig = {
  maxFileSize: 10 * 1024 * 1024,
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
  ],
  maxConcurrentUploads: 2,
  strategy: 'direct',
  retryAttempts: 3,
  retryDelay: 1000,
};

describe('UploadFacade', () => {
  let facade: UploadFacade;
  let directDriverSpy: jasmine.SpyObj<DirectDriver>;
  let presignedDriverSpy: jasmine.SpyObj<PresignedDriver>;

  beforeEach(() => {
    directDriverSpy = jasmine.createSpyObj('DirectDriver', [
      'upload',
      'cancel',
    ]);
    presignedDriverSpy = jasmine.createSpyObj('PresignedDriver', [
      'upload',
      'cancel',
    ]);

    TestBed.configureTestingModule({
      providers: [
        UploadFacade,
        { provide: DirectDriver, useValue: directDriverSpy },
        { provide: PresignedDriver, useValue: presignedDriverSpy },
        { provide: UPLOAD_CONFIG, useValue: TEST_UPLOAD_CONFIG },
      ],
    });

    facade = TestBed.inject(UploadFacade);
  });

  it('should be created', () => {
    expect(facade).toBeTruthy();
  });

  it('should respect maxConcurrentUploads', () => {
    const file1 = new File([''], 'file1.jpg', { type: 'image/jpeg' });
    const file2 = new File([''], 'file2.jpg', { type: 'image/jpeg' });
    const file3 = new File([''], 'file3.jpg', { type: 'image/jpeg' });

    // Mock upload to NOT complete immediately
    directDriverSpy.upload.and.returnValue(
      new Observable(() => {}) // Never complete
    );

    facade.setStrategy('direct');
    facade.addFiles([file1, file2, file3]);

    expect(facade.activeUploads().length).toBe(2);
    expect(facade.pendingUploads().length).toBe(1);
    expect(directDriverSpy.upload).toHaveBeenCalledTimes(2);
  });

  it('should cleanup subscriptions on cancel', () => {
    const file = new File([''], 'file.jpg', { type: 'image/jpeg' });
    const task = TaskFactory.createTask(file, 'direct', 'generic');

    directDriverSpy.upload.and.returnValue(of(task));

    facade.setStrategy('direct');
    const taskId = facade.addFile(file)!;

    expect(facade.activeUploads().length).toBe(1);

    facade.cancelUpload(taskId);

    expect(facade.activeUploads().length).toBe(0);
    expect(directDriverSpy.cancel).toHaveBeenCalledWith(taskId);
  });
});
