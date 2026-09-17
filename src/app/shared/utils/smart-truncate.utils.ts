/**
 * Smart text truncation for the feed.
 *
 * Visual limit ~280 characters: searches for a natural cut point nearby
 * (paragraph break > sentence end > soft break > word boundary) instead
 * of chopping mid-word.
 */

export interface SmartTruncation {
  /** Visible preview text (without "…", the component adds it). */
  readonly preview: string;
  /** True when the original text was actually truncated. */
  readonly isTruncated: boolean;
}

export const FEED_TEXT_LIMIT = 280;
const SEARCH_RADIUS = 60;
const OVERFLOW_TOLERANCE = 24;

/** True when the fragment carries anything beyond whitespace and punctuation. */
function hasMeaningfulContent(fragment: string): boolean {
  return /[^\s.,;:…]/u.test(fragment);
}

function isSentenceEnd(char: string): boolean {
  return char === '.' || char === '!' || char === '?' || char === '…';
}

function isSoftBreak(char: string): boolean {
  return char === ',' || char === ';' || char === ':' || char === '—' || char === '–';
}

/**
 * Find the best cut point in `text` near `target`.
 * Priority: double newline > sentence end > single newline > soft break > space.
 * Returns -1 when no candidate exists (a single long token with no whitespace).
 */
export function findSmartCutPoint(text: string, target: number = FEED_TEXT_LIMIT): number {
  const min = Math.max(0, target - SEARCH_RADIUS);
  const max = Math.min(text.length, target + SEARCH_RADIUS);
  if (min >= max) {
    return -1;
  }
  const window = text.slice(min, max);

  const lastDoubleBreak = window.lastIndexOf('\n\n');
  if (lastDoubleBreak !== -1) {
    return min + lastDoubleBreak;
  }

  for (let i = Math.min(window.length - 1, target - min + SEARCH_RADIUS); i >= 0; i--) {
    const char = window[i];
    const next = window[i + 1];
    if (
      char !== undefined &&
      isSentenceEnd(char) &&
      (next === undefined || next === ' ' || next === '\n')
    ) {
      const cut = min + i + 1;
      if (cut >= min + 10) {
        return cut;
      }
    }
  }

  const lastSingleBreak = window.lastIndexOf('\n');
  if (lastSingleBreak > 10) {
    return min + lastSingleBreak;
  }

  for (let i = Math.min(window.length - 1, target - min + 20); i >= 0; i--) {
    const char = window[i];
    const next = window[i + 1];
    if (
      char !== undefined &&
      isSoftBreak(char) &&
      (next === undefined || next === ' ' || next === '\n')
    ) {
      return min + i + 1;
    }
  }

  const lastSpace = window.lastIndexOf(' ');
  if (lastSpace !== -1) {
    return min + lastSpace;
  }

  return -1;
}

export function smartTruncate(
  raw: string | null | undefined,
  limit: number = FEED_TEXT_LIMIT,
): SmartTruncation {
  const text = (raw ?? '').replace(/\s+$/u, '');
  if (!text || text.length <= limit + OVERFLOW_TOLERANCE) {
    return { preview: text, isTruncated: false };
  }

  const cut = findSmartCutPoint(text, limit);
  const naturalEnd = cut > limit * 0.5 ? cut : limit;
  // A natural cut that hides nothing meaningful (e.g. a single trailing period)
  // is no cut at all: fall back to the hard limit so expanding reveals text.
  const end = hasMeaningfulContent(text.slice(naturalEnd)) ? naturalEnd : limit;

  const preview = text.slice(0, end).replace(/[\s.,;:…]+$/u, '');

  // Never advertise "more" when expanding would only surface punctuation.
  if (!hasMeaningfulContent(text.slice(end))) {
    return { preview: text, isTruncated: false };
  }

  return { preview, isTruncated: true };
}
