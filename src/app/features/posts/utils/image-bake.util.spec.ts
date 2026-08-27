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

  it('should bake without filter nor transform', async () => {
    const file = await bakeImageFilter(PIXEL_PNG, '', { transform: '' });
    expect(file.type).toBe('image/jpeg');
    expect(file.size).toBeGreaterThan(0);
  });

  it('should bake with only blur transform via options', async () => {
    const file = await bakeImageFilter(PIXEL_PNG, 'blur(5px)', { transform: '' });
    expect(file.type).toBe('image/jpeg');
    expect(file.size).toBeGreaterThan(0);
  });

  it('should bake with rotate 90 via transform string param', async () => {
    const file = await bakeImageFilter(PIXEL_PNG, '', 'rotate(90deg)');
    expect(file.type).toBe('image/jpeg');
    expect(file.size).toBeGreaterThan(0);
  });

  it('should bake with rotate 180 and 270', async () => {
    const file180 = await bakeImageFilter(PIXEL_PNG, null, { transform: 'rotate(180deg)' });
    const file270 = await bakeImageFilter(PIXEL_PNG, null, 'rotate(270deg)');
    expect(file180.type).toBe('image/jpeg');
    expect(file270.type).toBe('image/jpeg');
    expect(file180.size).toBeGreaterThan(0);
    expect(file270.size).toBeGreaterThan(0);
  });

  it('should bake with Filter+Blur+Rotate 90 combined', async () => {
    const file = await bakeImageFilter(PIXEL_PNG, 'grayscale(1) blur(5px)', {
      transform: 'rotate(90deg)',
    });
    expect(file.type).toBe('image/jpeg');
    expect(file.size).toBeGreaterThan(0);
  });

  it('should bake Gingham-like filter plus brightness via effectiveFilter', async () => {
    const file = await bakeImageFilter(PIXEL_PNG, 'grayscale(100%) brightness(1.5)', {
      transform: 'rotate(0deg)',
    });
    expect(file.type).toBe('image/jpeg');
    expect(file.size).toBeGreaterThan(0);
  });

  it('should accept transform as separate arg with options', async () => {
    const file = await bakeImageFilter(PIXEL_PNG, 'contrast(1.2)', 'rotate(90deg)', {
      fileName: 'rotated.jpg',
    });
    expect(file.type).toBe('image/jpeg');
    expect(file.name).toBe('rotated.jpg');
  });
});
