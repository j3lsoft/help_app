export const POST_IMAGE_MAX_DIMENSION = 1920;
const WEBP_QUALITY = 0.8;
const JPEG_FALLBACK_QUALITY = 0.8;
const RETRY_QUALITY = 0.7;
const SIZE_THRESHOLD_BYTES = 800 * 1024;

export function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error(`Could not load image from source: ${src}`));
    image.src = src;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mime, quality);
  });
}

async function exportOptimizedBlob(
  canvas: HTMLCanvasElement,
  preferredMime: string,
  quality: number
): Promise<{ blob: Blob; mime: string }> {
  let mime = preferredMime;
  let blob = await canvasToBlob(canvas, mime, quality);

  // Fallback to JPEG if WebP not supported (toBlob returns null)
  if (!blob && mime === 'image/webp') {
    mime = 'image/jpeg';
    blob = await canvasToBlob(canvas, mime, quality);
  }

  if (!blob) {
    throw new Error('Canvas export failed');
  }

  // Retry at lower quality if over budget and we have headroom
  if (blob.size > SIZE_THRESHOLD_BYTES && quality > RETRY_QUALITY) {
    const retryBlob = await canvasToBlob(canvas, mime, RETRY_QUALITY);
    if (retryBlob && retryBlob.size < blob.size) {
      blob = retryBlob;
    }
  }

  return { blob, mime };
}

export interface BakeOptions {
  maxDimension?: number;
  fileName?: string;
  quality?: number;
  /** CSS transform string, e.g. "rotate(90deg)". Only rotate is supported in v1. */
  transform?: string | null;
}

function parseRotateDegrees(transform: string | null | undefined): number {
  if (!transform) return 0;
  const match = transform.match(/rotate\(\s*(-?\d+(?:\.\d+)?)\s*deg\s*\)/i);
  if (!match) return 0;
  const deg = Number(match[1]);
  if (!Number.isFinite(deg)) return 0;
  // Normalize to 0..360
  const normalized = ((Math.round(deg) % 360) + 360) % 360;
  return normalized;
}

function resolveBakeArgs(
  cssFilter: string | null | undefined,
  optionsOrTransform?: string | null | undefined | BakeOptions,
  maybeOptions?: BakeOptions
): { filter: string | null | undefined; transform: string | null | undefined; options: BakeOptions } {
  // Overload: (filter, options) or (filter, transform, options)
  if (typeof optionsOrTransform === 'string' || optionsOrTransform === null || optionsOrTransform === undefined) {
    // Could be transform string or missing; check if maybeOptions is object
    const transform = optionsOrTransform as string | null | undefined;
    const options = maybeOptions ?? {};
    // If options also carries transform, prefer explicit param unless options.transform is set
    const effectiveTransform = transform ?? options.transform ?? null;
    const effectiveOptions = { ...options, transform: effectiveTransform } as BakeOptions;
    return { filter: cssFilter, transform: effectiveTransform, options: effectiveOptions };
  }
  // options object with possible transform inside
  const options = optionsOrTransform as BakeOptions;
  return { filter: cssFilter, transform: options.transform ?? null, options };
}

/**
 * Bakes a CSS filter and optional rotate transform into the actual bitmap via canvas
 * and returns an optimized image File (WebP preferente, JPEG fallback),
 * downscaled to maxDimension on its longest side.
 * This is what gets uploaded, so what the user previewed is what publishes.
 * Order deterministically: filter then rotate. Canvas dimensions are swapped for 90°/270°.
 */
export async function bakeImageFilter(
  src: string,
  cssFilter: string | null | undefined,
  optionsOrTransform?: string | null | undefined | BakeOptions,
  maybeOptions?: BakeOptions
): Promise<File> {
  const { filter, transform, options } = resolveBakeArgs(cssFilter, optionsOrTransform, maybeOptions);
  const maxDimension = options?.maxDimension ?? POST_IMAGE_MAX_DIMENSION;
  const preferredQuality = options?.quality ?? WEBP_QUALITY;

  const image = await loadImageElement(src);

  const scale = Math.min(
    1,
    maxDimension / Math.max(image.naturalWidth, image.naturalHeight)
  );
  const scaledWidth = Math.max(1, Math.round(image.naturalWidth * scale));
  const scaledHeight = Math.max(1, Math.round(image.naturalHeight * scale));

  const degrees = parseRotateDegrees(transform);
  const isQuarterTurn = degrees === 90 || degrees === 270;

  const canvasWidth = isQuarterTurn ? scaledHeight : scaledWidth;
  const canvasHeight = isQuarterTurn ? scaledWidth : scaledHeight;

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  ctx.filter = filter || 'none';

  if (degrees !== 0) {
    const rad = (degrees * Math.PI) / 180;
    ctx.translate(canvasWidth / 2, canvasHeight / 2);
    ctx.rotate(rad);
    ctx.drawImage(image, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);
  } else {
    ctx.drawImage(image, 0, 0, scaledWidth, scaledHeight);
  }

  ctx.filter = 'none';

  const { blob, mime } = await exportOptimizedBlob(canvas, 'image/webp', preferredQuality);
  const defaultName = mime === 'image/webp' ? 'post.webp' : 'post.jpg';
  return new File([blob], options?.fileName ?? defaultName, {
    type: mime,
  });
}
