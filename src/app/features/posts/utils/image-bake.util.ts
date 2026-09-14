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

  if ((!blob || blob.type !== mime) && mime === 'image/webp') {
    mime = 'image/jpeg';
    blob = await canvasToBlob(canvas, mime, quality);
  }

  if (!blob) {
    throw new Error('Canvas export failed');
  }
  mime = blob.type || mime;

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
  vignette?: number; // 0..100
  sharpen?: number; // 0..100
}

function parseRotateDegrees(transform: string | null | undefined): number {
  if (!transform) return 0;
  const match = transform.match(/rotate\(\s*(-?\d+(?:\.\d+)?)\s*deg\s*\)/i);
  if (!match) return 0;
  const deg = Number(match[1]);
  if (!Number.isFinite(deg)) return 0;
  const normalized = ((Math.round(deg) % 360) + 360) % 360;
  return normalized;
}

function resolveBakeArgs(
  cssFilter: string | null | undefined,
  optionsOrTransform?: string | null | undefined | BakeOptions,
  maybeOptions?: BakeOptions
): { filter: string | null | undefined; transform: string | null | undefined; options: BakeOptions } {
  if (typeof optionsOrTransform === 'string' || optionsOrTransform === null || optionsOrTransform === undefined) {
    const transform = optionsOrTransform as string | null | undefined;
    const options = maybeOptions ?? {};
    const effectiveTransform = transform ?? options.transform ?? null;
    const effectiveOptions = { ...options, transform: effectiveTransform } as BakeOptions;
    return { filter: cssFilter, transform: effectiveTransform, options: effectiveOptions };
  }
  const options = optionsOrTransform as BakeOptions;
  return { filter: cssFilter, transform: options.transform ?? null, options };
}

function applyVignette(ctx: CanvasRenderingContext2D, width: number, height: number, vignetteVal: number): void {
  if (vignetteVal <= 0) return;
  const clamped = Math.max(0, Math.min(100, vignetteVal));
  const radius = Math.sqrt(width * width + height * height) / 2;
  const outerRadius = radius;
  const innerRadius = radius * (1 - (clamped / 100) * 0.75);

  const gradient = ctx.createRadialGradient(
    width / 2,
    height / 2,
    innerRadius,
    width / 2,
    height / 2,
    outerRadius
  );
  const maxOpacity = (clamped / 100) * 0.85;
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(1, `rgba(0,0,0,${maxOpacity.toFixed(2)})`);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function applySharpen(ctx: CanvasRenderingContext2D, width: number, height: number, sharpenVal: number): void {
  if (sharpenVal <= 0 || width < 3 || height < 3) return;
  const factor = (Math.max(0, Math.min(100, sharpenVal)) / 100) * 0.5;

  try {
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    const copy = new Uint8ClampedArray(data);

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        for (let c = 0; c < 3; c++) {
          const center = copy[idx + c];
          const top = copy[((y - 1) * width + x) * 4 + c];
          const bottom = copy[((y + 1) * width + x) * 4 + c];
          const left = copy[(y * width + (x - 1)) * 4 + c];
          const right = copy[(y * width + (x + 1)) * 4 + c];

          const val = center * (1 + 4 * factor) - (top + bottom + left + right) * factor;
          data[idx + c] = Math.max(0, Math.min(255, val));
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);
  } catch {
    // Fail gracefully if canvas getImageData is blocked (security context)
  }
}

/**
 * Bakes a CSS filter, rotate transform, vignette, and sharpen into bitmap.
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

  // Apply post-drawing canvas effects: sharpen then vignette
  if (options.sharpen) {
    applySharpen(ctx, canvasWidth, canvasHeight, options.sharpen);
  }
  if (options.vignette) {
    applyVignette(ctx, canvasWidth, canvasHeight, options.vignette);
  }

  const { blob, mime } = await exportOptimizedBlob(canvas, 'image/webp', preferredQuality);
  const defaultName = mime === 'image/webp' ? 'post.webp' : 'post.jpg';
  return new File([blob], options?.fileName ?? defaultName, {
    type: mime,
  });
}
