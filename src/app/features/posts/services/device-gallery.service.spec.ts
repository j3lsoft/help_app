import { TestBed } from '@angular/core/testing';
import { MediaTypeSelection } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { DeviceGalleryService } from './device-gallery.service';

function spyOnNativeGallery(service: DeviceGalleryService): jasmine.Spy {
  return spyOn(
    service as unknown as { openNativeGallery: () => Promise<unknown> },
    'openNativeGallery'
  );
}

describe('DeviceGalleryService', () => {
  let service: DeviceGalleryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeviceGalleryService);
  });

  it('should return an empty selection for a non-positive slot count', async () => {
    spyOn(Capacitor, 'isNativePlatform').and.returnValue(true);
    const openSpy = spyOnNativeGallery(service);

    const result = await service.pickFromGallery(0);

    expect(result).toEqual([]);
    expect(openSpy).not.toHaveBeenCalled();
  });

  it('should open the native picker in multiple-selection mode', async () => {
    spyOn(Capacitor, 'isNativePlatform').and.returnValue(true);
    spyOn(Capacitor, 'convertFileSrc').and.callFake((uri: string) => `conv://${uri}`);
    const openSpy = spyOnNativeGallery(service).and.resolveTo({
      results: [
        { uri: 'file:///a.jpg', metadata: { format: 'jpeg' } },
        { uri: 'file:///b.png', metadata: { format: 'png' } },
      ],
    });

    const result = await service.pickFromGallery(3);

    expect(openSpy).toHaveBeenCalledTimes(1);
    expect(openSpy).toHaveBeenCalledWith({
      mediaType: MediaTypeSelection.Photo,
      allowMultipleSelection: true,
      limit: 3,
    });
    expect(result.length).toBe(2);
    expect(result[0]).toEqual({
      src: 'conv://file:///a.jpg',
      format: 'jpeg',
      origin: 'gallery',
    });
  });

  it('should keep single selection when only one slot remains', async () => {
    spyOn(Capacitor, 'isNativePlatform').and.returnValue(true);
    const openSpy = spyOnNativeGallery(service).and.resolveTo({ results: [] });

    await service.pickFromGallery(1);

    expect(openSpy).toHaveBeenCalledTimes(1);
    expect(openSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({ allowMultipleSelection: false, limit: 1 })
    );
  });

  it('should drop native results without a usable source', async () => {
    spyOn(Capacitor, 'isNativePlatform').and.returnValue(true);
    spyOn(Capacitor, 'convertFileSrc').and.callFake((uri: string) => `conv://${uri}`);
    spyOnNativeGallery(service).and.resolveTo({
      results: [{ metadata: { format: 'jpeg' } }, { uri: 'file:///ok.jpg' }],
    });

    const result = await service.pickFromGallery(5);

    expect(result.length).toBe(1);
    expect(result[0].src).toBe('conv://file:///ok.jpg');
  });

  it('should cap dropped files to the remaining slots', () => {
    const files = [
      new File(['a'], 'a.jpg', { type: 'image/jpeg' }),
      new File(['b'], 'b.png', { type: 'image/png' }),
    ];

    const result = service.fromFiles(files, 1);

    expect(result.length).toBe(1);
    expect(result[0].format).toBe('jpeg');
    expect(result[0].origin).toBe('web');
  });
});
