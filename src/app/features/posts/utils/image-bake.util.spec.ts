import { bakeImageFilter, loadImageElement } from './image-bake.util';

const PIXEL_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

describe('image-bake.util', () => {
  it('should load an image element from a data URL', async () => {
    const image = await loadImageElement(PIXEL_PNG);
    expect(image.naturalWidth).toBe(1);
    expect(image.naturalHeight).toBe(1);
  });

  it('should reject when the source cannot be loaded', async () => {
    await expectAsync(loadImageElement('blob:not-a-real-source')).toBeRejected();
  });

  it('should bake a JPEG file even with a CSS filter applied', async () => {
    const file = await bakeImageFilter(PIXEL_PNG, 'grayscale(1)', {
      fileName: 'test.jpeg',
    });

    expect(['image/webp', 'image/jpeg', 'image/png']).toContain(file.type);
    expect(file.name).toBe('test.jpeg');
    expect(file.size).toBeGreaterThan(0);
  });

  it('should bake without filter as well', async () => {
    const file = await bakeImageFilter(PIXEL_PNG, null);
    expect(['image/webp', 'image/jpeg', 'image/png']).toContain(file.type);
  });

  it('should bake without filter nor transform', async () => {
    const file = await bakeImageFilter(PIXEL_PNG, '', { transform: '' });
    expect(['image/webp', 'image/jpeg', 'image/png']).toContain(file.type);
    expect(file.size).toBeGreaterThan(0);
  });

  it('should bake with only blur transform via options', async () => {
    const file = await bakeImageFilter(PIXEL_PNG, 'blur(5px)', { transform: '' });
    expect(['image/webp', 'image/jpeg', 'image/png']).toContain(file.type);
    expect(file.size).toBeGreaterThan(0);
  });

  it('should bake with rotate 90 via transform string param', async () => {
    const file = await bakeImageFilter(PIXEL_PNG, '', 'rotate(90deg)');
    expect(['image/webp', 'image/jpeg', 'image/png']).toContain(file.type);
    expect(file.size).toBeGreaterThan(0);
  });

  it('should bake with rotate 180 and 270', async () => {
    const file180 = await bakeImageFilter(PIXEL_PNG, null, { transform: 'rotate(180deg)' });
    const file270 = await bakeImageFilter(PIXEL_PNG, null, 'rotate(270deg)');
    expect(['image/webp', 'image/jpeg', 'image/png']).toContain(file180.type);
    expect(['image/webp', 'image/jpeg', 'image/png']).toContain(file270.type);
    expect(file180.size).toBeGreaterThan(0);
    expect(file270.size).toBeGreaterThan(0);
  });

  it('should bake with Filter+Blur+Rotate 90 combined', async () => {
    const file = await bakeImageFilter(PIXEL_PNG, 'grayscale(1) blur(5px)', {
      transform: 'rotate(90deg)',
    });
    expect(['image/webp', 'image/jpeg', 'image/png']).toContain(file.type);
    expect(file.size).toBeGreaterThan(0);
  });

  it('should bake with vignette and sharpen options', async () => {
    const file = await bakeImageFilter(PIXEL_PNG, 'saturate(1.5)', {
      vignette: 50,
      sharpen: 30,
    });
    expect(['image/webp', 'image/jpeg', 'image/png']).toContain(file.type);
    expect(file.size).toBeGreaterThan(0);
  });

  it('should accept transform as separate arg with options', async () => {
    const file = await bakeImageFilter(PIXEL_PNG, 'contrast(1.2)', 'rotate(90deg)', {
      fileName: 'rotated.jpeg',
    });
    expect(['image/webp', 'image/jpeg', 'image/png']).toContain(file.type);
    expect(file.name).toBe('rotated.jpeg');
  });

  it('should bake optimized WebP by default with fallback name', async () => {
    const file = await bakeImageFilter(PIXEL_PNG, null);
    expect(['image/webp', 'image/jpeg', 'image/png']).toContain(file.type);
    expect(['post.webp', 'post.jpeg', 'post.png']).toContain(file.name);
    expect(file.size).toBeGreaterThan(0);
  });

  it('should fall back to JPEG when canvas silently returns PNG for webp (iOS Safari)', async () => {
    const original = HTMLCanvasElement.prototype.toBlob;
    spyOn(HTMLCanvasElement.prototype, 'toBlob').and.callFake(function (
      this: HTMLCanvasElement,
      callback: (blob: Blob | null) => void,
      type?: string,
      quality?: number
    ): void {
      if (type === 'image/webp') {
        callback(new Blob(['fake-png-bytes'], { type: 'image/png' }));
        return;
      }
      original.call(this, callback, type, quality);
    });

    // Opaque PNG (no alpha) so fallback is JPEG, not PNG via alpha path
    const OPAQUE_PNG =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4//8/AAX+Av4N70a4AAAAAElFTkSuQmCC';
    const file = await bakeImageFilter(OPAQUE_PNG, null);

    expect(file.type).toBe('image/jpeg');
    expect(file.name).toBe('post.jpeg');
    expect(file.size).toBeGreaterThan(0);
  });
});
