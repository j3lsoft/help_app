import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FEED_TEXT_LIMIT, smartTruncate } from '@shared/utils/smart-truncate.utils';
import {
  HashtagSegment,
  splitHashtagSegments,
} from '@shared/utils/hashtag.utils';

/**
 * Inline text with a smart cut at ~280 chars. Shows "…Show more" to expand.
 * Expansion is one-way: once expanded the toggle disappears and there is no
 * collapse. Resets when the bound text changes (e.g. the post is edited).
 * Hashtag tokens render as tappable segments and emit `hashtagTap`.
 */
@Component({
  selector: 'app-expandable-text',
  standalone: true,
  templateUrl: './expandable-text.component.html',
  styleUrls: ['./expandable-text.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpandableTextComponent {
  readonly text = input.required<string>();
  readonly limit = input<number>(FEED_TEXT_LIMIT);

  /** Tag (without `#`) of a tapped hashtag token. */
  readonly hashtagTap = output<string>();

  readonly expanded = signal(false);
  private readonly truncation = computed(() => smartTruncate(this.text(), this.limit()));
  private readonly contentRef = viewChild.required<ElementRef<HTMLElement>>('content');

  readonly isTruncated = computed(() => this.truncation().isTruncated);
  readonly displayText = computed(() =>
    this.expanded() ? this.text().replace(/\s+$/u, '') : this.truncation().preview,
  );
  readonly isCollapsedView = computed(() => this.isTruncated() && !this.expanded());

  /**
   * Segments to render. A truncated preview can cut a hashtag token in half,
   * so the trailing token of a collapsed truncation stays plain text instead
   * of linking to a half tag.
   */
  readonly segments = computed<HashtagSegment[]>(() => {
    const segments = splitHashtagSegments(this.displayText());
    const last = segments[segments.length - 1];
    if (this.isCollapsedView() && last?.hashtag) {
      segments[segments.length - 1] = { text: last.text };
    }
    return segments;
  });

  constructor() {
    // Reset expansion when the bound text changes (e.g. the post is edited),
    // so a different body never renders already expanded.
    effect(() => {
      this.text();
      this.expanded.set(false);
    });
  }

  onHashtagTap(hashtag: string): void {
    this.hashtagTap.emit(hashtag);
  }

  expand(): void {
    this.expanded.set(true);
    // The toggle unmounts on expand; move focus to the text so keyboard and
    // screen-reader users keep their position instead of falling back to body.
    this.contentRef().nativeElement.focus();
  }
}
