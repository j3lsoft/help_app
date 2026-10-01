import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { LoggerService } from '../../../logger.service';
import {
  MediaFileResponseDto,
  MediaUploadError,
  UploadConfig,
} from '../models';
import { UPLOAD_CONFIG } from '../upload.token';
import { MediaUpload } from './media-upload.service';
import { UploadApiService } from './upload-api.service';

const TEST_CONFIG: UploadConfig = {
  limits: {
    avatar: {
      maxBytes: 5 * 1024 * 1024,
      allowedMimeTypes: ['image/jpeg', 'image/png'],
    },
    post_image: {
      maxBytes: 2 * 1024 * 1024,
      allowedMimeTypes: ['image/jpeg', 'image/webp'],
    },
    post_video: { maxBytes: 10 * 1024 * 1024, allowedMimeTypes: ['video/mp4'] },
    story: { maxBytes: 10 * 1024 * 1024, allowedMimeTypes: ['image/jpeg'] },
    generic: { maxBytes: 10 * 1024 * 1024, allowedMimeTypes: ['image/jpeg'] },
  },
  retryAttempts: 2,
  retryDelay: 0,
};

const PRESIGNED = {
  id: 'file-1',
  key: 'uploads/photo.jpg',
  uploadUrl: 'https://s3/put',
};

const MEDIA: MediaFileResponseDto = {
  id: 'media-1',
  key: 'uploads/photo.jpg',
  publicUrl: 'https://storage.example.com/uploads/photo.jpg',
  mimeType: 'image/jpeg',
  size: 3,
  ownerId: 'user-1',
};

describe('MediaUpload', () => {
  let service: MediaUpload;
  let apiSpy: jasmine.SpyObj<UploadApiService>;

  function jpeg(): File {
    return new File(['xxx'], 'photo.jpg', { type: 'image/jpeg' });
  }

  beforeEach(() => {
    apiSpy = jasmine.createSpyObj<UploadApiService>('UploadApiService', [
      'getPresignedUrl',
      'uploadToStorage',
      'confirmUpload',
      'deleteFile',
    ]);
    apiSpy.getPresignedUrl.and.returnValue(of(PRESIGNED));
    apiSpy.uploadToStorage.and.returnValue(of(100));
    apiSpy.confirmUpload.and.returnValue(of(MEDIA));
    apiSpy.deleteFile.and.returnValue(of({ success: true }));

    TestBed.configureTestingModule({
      providers: [
        MediaUpload,
        { provide: UploadApiService, useValue: apiSpy },
        { provide: UPLOAD_CONFIG, useValue: TEST_CONFIG },
      ],
    });
    service = TestBed.inject(MediaUpload);
    TestBed.inject(LoggerService);
  });

  it('should upload through presign, storage and confirm', async () => {
    const result = await service.upload(jpeg(), { uploadType: 'post_image' });

    expect(result).toEqual({
      id: 'media-1',
      key: 'uploads/photo.jpg',
      publicUrl: 'https://storage.example.com/uploads/photo.jpg',
      mimeType: 'image/jpeg',
      size: 3,
      ownerId: 'user-1',
    });
    expect(apiSpy.getPresignedUrl).toHaveBeenCalled();
    expect(apiSpy.uploadToStorage).toHaveBeenCalled();
    expect(apiSpy.confirmUpload).toHaveBeenCalled();
  });

  it('should reject a file over the type limit without calling the API', async () => {
    const big = new File([new Uint8Array(3 * 1024 * 1024)], 'big.jpg', {
      type: 'image/jpeg',
    });

    await expectRejection(
      service.upload(big, { uploadType: 'post_image' }),
      'file_too_large',
    );
    expect(apiSpy.getPresignedUrl).not.toHaveBeenCalled();
  });

  it('should reject a disallowed MIME type without calling the API', async () => {
    const clip = new File(['x'], 'clip.mp4', { type: 'video/mp4' });

    await expectRejection(
      service.upload(clip, { uploadType: 'post_image' }),
      'file_type_not_allowed',
    );
    expect(apiSpy.getPresignedUrl).not.toHaveBeenCalled();
  });

  it('should retry a transient failure and then succeed', async () => {
    let attempts = 0;
    apiSpy.getPresignedUrl.and.callFake(() => {
      attempts++;
      if (attempts === 1) {
        return throwError(() => ({ status: 500, message: 'boom' }));
      }
      return of(PRESIGNED);
    });

    const result = await service.upload(jpeg(), { uploadType: 'post_image' });

    expect(attempts).toBe(2);
    expect(result.id).toBe('media-1');
  });

  it('should not retry a conclusive credentials failure', async () => {
    apiSpy.getPresignedUrl.and.returnValue(
      throwError(() => ({ status: 401, message: 'unauthorized' })),
    );

    await expectRejection(
      service.upload(jpeg(), { uploadType: 'post_image' }),
      'presigned_url_failed',
    );
    expect(apiSpy.getPresignedUrl).toHaveBeenCalledTimes(1);
  });

  it('should not retry a forbidden failure', async () => {
    apiSpy.getPresignedUrl.and.returnValue(
      throwError(() => ({ status: 403, message: 'forbidden' })),
    );

    await expectRejection(
      service.upload(jpeg(), { uploadType: 'post_image' }),
      'presigned_url_failed',
    );
    expect(apiSpy.getPresignedUrl).toHaveBeenCalledTimes(1);
  });

  it('should report progress from 0 to 100', async () => {
    apiSpy.uploadToStorage.and.callFake((_url, _file, onProgress) => {
      onProgress?.(50);
      return of(100);
    });
    const percents: number[] = [];

    await service.upload(jpeg(), {
      uploadType: 'post_image',
      onProgress: (percent) => percents.push(percent),
    });

    expect(percents[0]).toBe(0);
    expect(percents[percents.length - 1]).toBe(100);
    expect(percents.some((percent) => percent > 0 && percent < 100)).toBeTrue();
  });

  it('should remove a MediaFile by id', async () => {
    await service.remove('media-9');

    expect(apiSpy.deleteFile).toHaveBeenCalledWith('media-9');
  });
});

async function expectRejection(
  promise: Promise<unknown>,
  expectedCode: string,
): Promise<void> {
  try {
    await promise;
    fail('expected MediaUploadError');
  } catch (error) {
    expect(error).toBeInstanceOf(MediaUploadError);
    expect((error as MediaUploadError).code).toBe(expectedCode);
  }
}
