import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ProfileTab } from '../../models/profile-tab.model';

/** Region of the profile page a skeleton placeholder mirrors. */
export type ProfileSkeletonRegion = 'header' | 'content';

/** Action buttons the header skeleton must reserve space for. */
export type ProfileSkeletonActions = 'single' | 'double';

/**
 * Layout-shaped placeholders for a profile page. Every shape mirrors the block
 * it replaces (see `ProfileHeaderComponent`, `PostCardComponent` and
 * `ProfileMediaGridComponent`) so the swap to real content does not shift the
 * layout. The shimmer technique mirrors `PostDetailPage`.
 */
@Component({
  selector: 'app-profile-skeleton',
  templateUrl: './profile-skeleton.component.html',
  styleUrls: ['./profile-skeleton.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileSkeletonComponent {
  /** Which region of the page is loading. */
  readonly region = input.required<ProfileSkeletonRegion>();

  /** Content tab whose shape to mirror. Only used with `region="content"`. */
  readonly tab = input<ProfileTab>('posts');

  /** Header action buttons to reserve. Only used with `region="header"`. */
  readonly actions = input<ProfileSkeletonActions>('double');
}
