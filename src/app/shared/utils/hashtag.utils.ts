/**
 * Client-side mirror of the backend hashtag extraction rules
 * (write-time tokens starting with `#`, Unicode letters/digits/underscore).
 */

/** Hard cap the backend enforces per Post; extras are dropped silently. */
export const HASHTAG_LIMIT = 10;

const HASHTAG_TOKEN = /#[\p{L}\p{N}_]+/gu;

/** A piece of rendered text; `hashtag` holds the token without the `#`. */
export interface HashtagSegment {
  text: string;
  hashtag?: string;
}

/** Lowercased, deduped hashtags of a Post content, capped like the backend. */
export function extractHashtags(content: string): string[] {
  const matches = content.match(HASHTAG_TOKEN) ?? [];
  const unique = new Set(matches.map((token) => token.slice(1).toLowerCase()));
  return [...unique].slice(0, HASHTAG_LIMIT);
}

/** Unique lowercase hashtags in a content, without the backend cap. */
export function countHashtags(content: string): number {
  const matches = content.match(HASHTAG_TOKEN) ?? [];
  return new Set(matches.map((token) => token.slice(1).toLowerCase())).size;
}

/** Splits text into plain and hashtag segments for inline rendering. */
export function splitHashtagSegments(text: string): HashtagSegment[] {
  const segments: HashtagSegment[] = [];
  const regex = new RegExp(HASHTAG_TOKEN.source, 'gu');
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const start = match.index;
    if (start > lastIndex) {
      segments.push({ text: text.slice(lastIndex, start) });
    }
    segments.push({ text: match[0], hashtag: match[0].slice(1) });
    lastIndex = start + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex) });
  }

  return segments;
}

/**
 * The trailing `#partial` being typed at the end of the caption, without the
 * `#`; `null` when the caret is not inside a hashtag token.
 */
export function currentHashtagQuery(text: string): string | null {
  const match = /#([\p{L}\p{N}_]*)$/u.exec(text);
  return match ? (match[1] ?? '') : null;
}

/** Replaces the trailing `#partial` with a completed `#tag` plus a space. */
export function completeHashtagQuery(text: string, tag: string): string {
  return text.replace(/#[\p{L}\p{N}_]*$/u, `#${tag} `);
}
