import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  signal,
} from '@angular/core';
import { FEED_TEXT_LIMIT, smartTruncate } from '@shared/utils/smart-truncate.utils';

/**
 * Inline text with a smart cut at ~280 chars. Shows "…more" to expand
 * and "less" to collapse. Resets on input change (feed recycling).
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

  readonly expanded = signal(false);
  private readonly truncation = computed(() => smartTruncate(this.text(), this.limit()));

  readonly isTruncated = computed(() => this.truncation().isTruncated);
  readonly displayText = computed(() =>
    this.expanded() ? this.text().replace(/\s+$/u, '') : this.truncation().preview,
  );
  readonly isCollapsedView = computed(() => this.isTruncated() && !this.expanded());

  constructor() {
    // Component is recycled inside the feed @for. Reset collapse state
    // whenever the parent post changes so stale expansion doesn't carry over.
    effect(
      () => {
        this.text();
        this.expanded.set(false);
      },
      { allowSignalWrites: true },
    );
  }

  toggle(): void {
    this.expanded.update((value) => !value);
  }
}
