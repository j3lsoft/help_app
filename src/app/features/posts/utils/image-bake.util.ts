export const POST_IMAGE_MAX_DIMENSION = 1920;
const JPEG_QUALITY = 0.92;

export function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error(`Could not load image from source: ${src}`));
    image.src = src;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Canvas export failed'))),
      'image/jpeg',
      quality
    );
  });
}

/**
 * Bakes a CSS filter into the actual bitmap via canvas and returns a
 * JPEG File, downscaled to maxDimension on its longest side.
 * This is what gets uploaded, so what the user previewed is what publishes.
 */
export async function bakeImageFilter(
  src: string,
  cssFilter: string | null | undefined,
  options?: { maxDimension?: number; fileName?: string; quality?: number }
): Promise<File> {
  const maxDimension = options?.maxDimension ?? POST_IMAGE_MAX_DIMENSION;
  const quality = options?.quality ?? JPEG_QUALITY;

  const image = await loadImageElement(src);

  const scale = Math.min(
    1,
    maxDimension / Math.max(image.naturalWidth, image.naturalHeight)
  );
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  ctx.filter = cssFilter || 'none';
  ctx.drawImage(image, 0, 0, width, height);
  ctx.filter = 'none';

  const blob = await canvasToBlob(canvas, quality);
  return new File([blob], options?.fileName ?? 'post.jpg', {
    type: 'image/jpeg',
  });
}
