import { MediaItem, PostEditState } from '../models/post-creation.model';

function toBrightnessFilter(value: number): string {
  if (value === 0) return '';
  return `brightness(${1 + value / 100})`;
}

function toContrastFilter(value: number): string {
  if (value === 0) return '';
  return `contrast(${1 + value / 100})`;
}

function toBlurFilter(value: number): string {
  if (value === 0) return '';
  return `blur(${value}px)`;
}

function toSaturationFilter(value: number): string {
  if (value === 0) return '';
  return `saturate(${1 + value / 100})`;
}

function toWarmthFilter(value: number): string {
  if (value === 0) return '';
  if (value > 0) {
    // Round half-up before formatting; `toFixed` alone loses the .5 case to
    // floating point (0.175 -> "0.17").
    const sepiaVal = Math.round((value / 100) * 0.35 * 100) / 100;
    const hueVal = -value * 0.15;
    return `sepia(${sepiaVal.toFixed(2)}) hue-rotate(${hueVal.toFixed(1)}deg)`;
  }
  const hueVal = Math.abs(value) * 0.2;
  return `hue-rotate(${hueVal.toFixed(1)}deg)`;
}

/** CSS filter string for preview and bake (preset + composable edits). */
export function buildEffectiveFilterCss(
  presetFilter: string,
  edits: PostEditState
): string {
  const base = presetFilter.trim();
  const { brightness, contrast, blur, saturation, warmth } = edits;
  const parts = [
    base,
    toBrightnessFilter(brightness),
    toContrastFilter(contrast),
    toSaturationFilter(saturation),
    toWarmthFilter(warmth),
    toBlurFilter(blur),
  ].filter(Boolean);
  return parts.join(' ');
}

export function buildEffectiveFilterCssForItem(item: MediaItem): string {
  return buildEffectiveFilterCss(item.filter, item.edits);
}

/** CSS transform for rotate steps (0..3 × 90°). */
export function buildEffectiveTransformCss(edits: PostEditState): string {
  const { rotate } = edits;
  if (rotate === 0) return '';
  return `rotate(${rotate * 90}deg)`;
}

export function buildEffectiveTransformCssForItem(item: MediaItem): string {
  return buildEffectiveTransformCss(item.edits);
}

/** True when the item has a preset filter or any non-neutral edit applied. */
export function hasVisualChanges(item: MediaItem): boolean {
  if (item.filter.trim().length > 0) return true;
  const edits = item.edits;
  return (
    edits.brightness !== 0 ||
    edits.contrast !== 0 ||
    edits.blur !== 0 ||
    edits.rotate !== 0 ||
    edits.saturation !== 0 ||
    edits.warmth !== 0 ||
    edits.vignette !== 0 ||
    edits.sharpen !== 0
  );
}
