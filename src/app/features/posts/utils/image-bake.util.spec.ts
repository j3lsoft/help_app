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
      fileName: 'test.jpg',
    });

    expect(file.type).toBe('image/jpeg');
    expect(file.name).toBe('test.jpg');
    expect(file.size).toBeGreaterThan(0);
  });

  it('should bake without filter as well', async () => {
    const file = await bakeImageFilter(PIXEL_PNG, null);
    expect(file.type).toBe('image/jpeg');
  });
});
