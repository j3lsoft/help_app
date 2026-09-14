export const POST_IMAGE_MAX_DIMENSION = 2048;
const JPEG_PHOTO_QUALITY = 0.85;
const WEBP_SCREENSHOT_QUALITY = 0.88;
const WEBP_ALPHA_QUALITY = 0.88;
// Back-compat aliases
const WEBP_QUALITY = JPEG_PHOTO_QUALITY;
const JPEG_FALLBACK_QUALITY = JPEG_PHOTO_QUALITY;
const RETRY_QUALITY = 0.7;
const SIZE_THRESHOLD_BYTES = 800 * 1024;
const MAX_CLIENT_BYTES = 2 * 1024 * 1024;
const SCREENSHOT_MAX_WIDTH = 1600;
const SCREENSHOT_SIZE_THRESHOLD = 900 * 1024;

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

function parseDataUrlMime(src: string): string | null {
  const match = src.match(/^data:([^;]+);/);
  return match ? match[1].toLowerCase() : null;
}

function estimateDataUrlSize(src: string): number | null {
  if (!src.startsWith('data:')) return null;
  const comma = src.indexOf(',');
  if (comma === -1) return null;
  const base64 = src.slice(comma + 1);
  // approx: 3 bytes per 4 base64 chars
  return Math.floor((base64.length * 3) / 4);
}

function detectHasAlpha(canvas: HTMLCanvasElement): boolean {
  try {
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;
    // sample 32x32 thumbnail to avoid reading full 2048² for alpha check when not needed
    const w = Math.min(canvas.width, 32);
    const h = Math.min(canvas.height, 32);
    const tmp = document.createElement('canvas');
    tmp.width = w;
    tmp.height = h;
    const tctx = tmp.getContext('2d');
    if (!tctx) return false;
    tctx.drawImage(canvas, 0, 0, w, h);
    const data = tctx.getImageData(0, 0, w, h).data;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 255) return true;
    }
    return false;
  } catch {
    return false;
  }
}

type ImageKind = 'photo' | 'screenshot' | 'alpha';

function classifyImageKind(
  src: string,
  image: HTMLImageElement,
  canvas: HTMLCanvasElement,
  options: BakeOptions
): ImageKind {
  // explicit hint from caller wins
  const hintMime = (options as { originalMime?: string }).originalMime?.toLowerCase() ?? parseDataUrlMime(src);
  const hintSize =
    (options as { originalSize?: number }).originalSize ?? estimateDataUrlSize(src) ?? null;

  const hasAlpha = detectHasAlpha(canvas);
  if (hasAlpha) return 'alpha';

  const isPngSource = hintMime === 'image/png';
  if (isPngSource) {
    const smallDimension = image.naturalWidth <= SCREENSHOT_MAX_WIDTH;
    const smallFile = hintSize !== null && hintSize < SCREENSHOT_SIZE_THRESHOLD;
    if (smallDimension || smallFile) return 'screenshot';
    // Fallback: large PNG photos (e.g. camera PNG) stay as photo → JPEG
    // but PNG screenshots with large dimensions still count if file is reasonably small
    // keep photo default for large PNGs
  }
  return 'photo';
}

async function exportOptimizedBlob(
  canvas: HTMLCanvasElement,
  preferredMime: string,
  quality: number
): Promise<{ blob: Blob; mime: string }> {
  let mime = preferredMime;
  let blob = await canvasToBlob(canvas, mime, quality);

  if (preferredMime === 'image/webp' && (!blob || blob.type !== mime)) {
    // WebP not supported or iOS Safari returns PNG for webp request → fallback to JPEG for screenshot/photo
    // Alpha path is handled separately via exportAlphaBlob which falls back to PNG
    mime = 'image/jpeg';
    blob = await canvasToBlob(canvas, mime, quality);
  }

  // PNG fallback for alpha: if we asked webp and got png, keep it
  if (!blob) {
    throw new Error('Canvas export failed');
  }
  mime = blob.type || mime;

  // New budget: allow up to 2MB, only retry if exceeds MAX_CLIENT_BYTES
  if (blob.size > MAX_CLIENT_BYTES) {
    const retries = quality === WEBP_SCREENSHOT_QUALITY || quality === WEBP_ALPHA_QUALITY
      ? [0.8, 0.75]
      : quality === JPEG_PHOTO_QUALITY
        ? [0.8, 0.75]
        : [RETRY_QUALITY];
    for (const q of retries) {
      if (q >= quality) continue;
      const retryBlob = await canvasToBlob(canvas, mime, q);
      if (retryBlob && retryBlob.size < blob.size) {
        blob = retryBlob;
        mime = retryBlob.type || mime;
        if (blob.size <= MAX_CLIENT_BYTES) break;
      }
    }
    // Legacy 800KB retry kept for back-compat when quality still high and size >800KB but <=2MB?
    // Skipped: new budget is 2MB, we don't downscale 1.5MB photo to 0.70 anymore.
  }

  return { blob, mime };
}

async function exportAlphaBlob(
  canvas: HTMLCanvasElement,
  quality: number
): Promise<{ blob: Blob; mime: string }> {
  let blob = await canvasToBlob(canvas, 'image/webp', quality);
  if (blob && blob.type === 'image/webp') {
    if (blob.size > MAX_CLIENT_BYTES) {
      const retry = await canvasToBlob(canvas, 'image/webp', 0.8);
      if (retry && retry.size < blob.size) blob = retry;
    }
    return { blob, mime: blob.type || 'image/webp' };
  }
  // Fallback to PNG (lossless, preserves alpha)
  blob = await canvasToBlob(canvas, 'image/png', 1.0);
  if (!blob) throw new Error('Canvas export failed');
  return { blob, mime: blob.type || 'image/png' };
}

export interface BakeOptions {
  maxDimension?: number;
  fileName?: string;
  quality?: number;
  /** CSS transform string, e.g. "rotate(90deg)". Only rotate is supported in v1. */
  transform?: string | null;
  vignette?: number; // 0..100
  sharpen?: number; // 0..100
  /** Hint for auto-classification: original mime (e.g. image/png) */
  originalMime?: string;
  /** Hint for auto-classification: original file size in bytes */
  originalSize?: number;
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
  const hasExplicitQuality = options?.quality !== undefined && options?.quality !== null;

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

  // Differentiated pipeline: foto→JPEG 0.85, screenshot→WebP 0.88, alpha→WebP/PNG
  const kind = classifyImageKind(src, image, canvas, options);
  let blob: Blob;
  let mime: string;

  if (kind === 'alpha') {
    const q = hasExplicitQuality ? options.quality! : WEBP_ALPHA_QUALITY;
    const res = await exportAlphaBlob(canvas, q);
    blob = res.blob;
    mime = res.mime;
  } else if (kind === 'screenshot') {
    const q = hasExplicitQuality ? options.quality! : WEBP_SCREENSHOT_QUALITY;
    const res = await exportOptimizedBlob(canvas, 'image/webp', q);
    blob = res.blob;
    mime = res.mime;
  } else {
    const q = hasExplicitQuality ? options.quality! : JPEG_PHOTO_QUALITY;
    // Photo path: JPEG directly with 2MB budget retries
    let initial = await canvasToBlob(canvas, 'image/jpeg', q);
    if (!initial) throw new Error('Canvas export failed');
    blob = initial;
    mime = initial.type || 'image/jpeg';
    if (blob.size > MAX_CLIENT_BYTES) {
      for (const rq of [0.8, 0.75]) {
        if (rq >= q) continue;
        const retry = await canvasToBlob(canvas, 'image/jpeg', rq);
        if (retry && retry.size < blob.size) {
          blob = retry;
          mime = retry.type || mime;
          if (blob.size <= MAX_CLIENT_BYTES) break;
        }
      }
    }
  }

  const defaultName =
    mime === 'image/webp' ? 'post.webp' : mime === 'image/png' ? 'post.png' : 'post.jpeg';
  return new File([blob], options?.fileName ?? defaultName, {
    type: mime,
  });
}
