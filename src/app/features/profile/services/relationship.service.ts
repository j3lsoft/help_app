import { Injectable, Signal, computed, effect, inject, signal } from '@angular/core';
import { EMPTY, Observable, catchError, map, tap, throwError } from 'rxjs';
import { LoggerService } from '@core/services/logger.service';
import { AuthService } from '@features/auth/services/auth.service';
import { FollowApiService } from './follow-api.service';

/**
 * Social state between the viewer and one target user. `isToggling` exposes the
 * single-flight guard so a button can disable itself while a toggle is pending.
 */
export interface Relationship {
  isFollowing: boolean;
  followsYou: boolean;
  isToggling: boolean;
}

/** Derived counters for one target user, with any optimistic delta baked in. */
export interface SocialCounts {
  followerCount: number;
  followingCount: number;
}

interface RelationshipEntry {
  isFollowing: boolean;
  followsYou: boolean;
  isToggling: boolean;
  followerBase: number;
  followingBase: number;
  followerDelta: number;
  followingDelta: number;
}

const NEUTRAL_RELATIONSHIP: Relationship = {
  isFollowing: false,
  followsYou: false,
  isToggling: false,
};

const NEUTRAL_COUNTS: SocialCounts = {
  followerCount: 0,
  followingCount: 0,
};

function emptyEntry(): RelationshipEntry {
  return {
    isFollowing: false,
    followsYou: false,
    isToggling: false,
    followerBase: 0,
    followingBase: 0,
    followerDelta: 0,
    followingDelta: 0,
  };
}

/**
 * Single authority for the viewer's `Relationship` to any target user: the
 * follow bit, membership-facing reads, and the `SocialCounts` an optimistic
 * follow moves (the target's `followerCount` and the viewer's `followingCount`).
 *
 * Optimistic and single-flight: `toggle` flips state immediately, rolls every
 * affected value back on failure, then rethrows so the caller surfaces the
 * error. Server truth enters through `prime`/`load`, which are ignored for a
 * user while its toggle is in flight. State is scoped to the session and
 * cleared when the authenticated viewer changes.
 */
@Injectable({
  providedIn: 'root',
})
export class RelationshipService {
  private readonly followApi = inject(FollowApiService);
  private readonly auth = inject(AuthService);
  private readonly logger = inject(LoggerService);

  private readonly _entries = signal<Map<string, RelationshipEntry>>(new Map());
  private readonly _viewerId = signal<string | null>(
    this.auth.currentUser()?.id ?? null,
  );

  private readonly relationshipSignals = new Map<string, Signal<Relationship>>();
  private readonly countsSignals = new Map<string, Signal<SocialCounts>>();

  constructor() {
    effect(() => {
      const viewerId = this.auth.currentUser()?.id ?? null;
      if (viewerId !== this._viewerId()) {
        this._viewerId.set(viewerId);
        this._entries.set(new Map());
      }
    });
  }

  relationship(userId: string): Signal<Relationship> {
    return this.memoize(this.relationshipSignals, userId, () => {
      const entry = this._entries().get(userId);
      if (!entry) return NEUTRAL_RELATIONSHIP;
      return {
        isFollowing: entry.isFollowing,
        followsYou: entry.followsYou,
        isToggling: entry.isToggling,
      };
    });
  }

  counts(userId: string): Signal<SocialCounts> {
    return this.memoize(this.countsSignals, userId, () => {
      const entry = this._entries().get(userId);
      if (!entry) return NEUTRAL_COUNTS;
      return {
        followerCount: entry.followerBase + entry.followerDelta,
        followingCount: entry.followingBase + entry.followingDelta,
      };
    });
  }

  isToggling(userId: string): boolean {
    return this.relationship(userId)().isToggling;
  }

  /** Enters server truth for a target's relationship; ignored while toggling. */
  prime(
    userId: string,
    relationship: Pick<Relationship, 'isFollowing' | 'followsYou'>,
  ): void {
    if (this.isToggling(userId)) return;
    this.updateEntries((entries) => {
      const current = entries.get(userId) ?? emptyEntry();
      entries.set(userId, {
        ...current,
        isFollowing: relationship.isFollowing,
        followsYou: relationship.followsYou,
      });
    });
  }

  /** Loads a target's `SocialCounts`; ignored while toggling, resets deltas. */
  load(userId: string): Observable<void> {
    if (this.isToggling(userId)) return EMPTY;

    return this.followApi.getSocialState(userId).pipe(
      tap((state) => {
        // A toggle that started after this load began wins; drop the response.
        if (this.isToggling(userId)) return;
        this.updateEntries((entries) => {
          const current = entries.get(userId) ?? emptyEntry();
          entries.set(userId, {
            ...current,
            followerBase: state.followerCount,
            followingBase: state.followeeCount,
            followerDelta: 0,
            followingDelta: 0,
          });
        });
      }),
      map(() => void 0),
      catchError((error: unknown) => {
        this.logger.error('Failed to load social state', {
          context: 'RelationshipService',
          data: { userId, error },
        });
        return throwError(() => error);
      }),
    );
  }

  /**
   * Optimistically flips the relationship. A second call for the same user
   * while the first is in flight is dropped (`EMPTY`): the UI disables the
   * button on `isToggling`, and the first call owns the error surfacing.
   */
  toggle(userId: string): Observable<void> {
    const entry = this.entry(userId);
    if (entry.isToggling) return EMPTY;

    const viewerIdAtStart = this._viewerId();
    const nextFollowing = !entry.isFollowing;
    const delta = nextFollowing ? 1 : -1;
    const affectsViewer = viewerIdAtStart !== null && viewerIdAtStart !== userId;

    this.updateEntries((entries) => {
      entries.set(userId, {
        ...(entries.get(userId) ?? emptyEntry()),
        isFollowing: nextFollowing,
        isToggling: true,
        followerDelta: entry.followerDelta + delta,
      });
      if (affectsViewer) {
        const viewer = entries.get(viewerIdAtStart) ?? emptyEntry();
        entries.set(viewerIdAtStart, {
          ...viewer,
          followingDelta: viewer.followingDelta + delta,
        });
      }
    });

    const request: Observable<unknown> = nextFollowing
      ? this.followApi.follow(userId)
      : this.followApi.unfollow(userId);

    const settle = (rolledBack: boolean): void => {
      // An in-flight toggle must not repopulate a map cleared by a viewer change.
      if ((this.auth.currentUser()?.id ?? null) !== viewerIdAtStart) return;
      this.updateEntries((entries) => {
        const current = entries.get(userId);
        if (!current) return;
        entries.set(userId, {
          ...current,
          isToggling: false,
          ...(rolledBack
            ? { isFollowing: entry.isFollowing, followerDelta: entry.followerDelta }
            : {}),
        });
        if (rolledBack && affectsViewer) {
          // Compose with other in-flight toggles by undoing only this delta.
          const viewer = entries.get(viewerIdAtStart) ?? emptyEntry();
          entries.set(viewerIdAtStart, {
            ...viewer,
            followingDelta: viewer.followingDelta - delta,
          });
        }
      });
    };

    return request.pipe(
      map(() => void 0),
      tap(() => {
        settle(false);
        this.logger.info(nextFollowing ? 'Followed user' : 'Unfollowed user', {
          context: 'RelationshipService',
          data: { userId },
        });
      }),
      catchError((error: unknown) => {
        settle(true);
        this.logger.error('Follow toggle failed; rolled back', {
          context: 'RelationshipService',
          data: { userId, error },
        });
        return throwError(() => error);
      }),
    );
  }

  private entry(userId: string): RelationshipEntry {
    const existing = this._entries().get(userId);
    if (existing) return existing;
    const fresh = emptyEntry();
    this.updateEntries((entries) => entries.set(userId, fresh));
    return fresh;
  }

  private updateEntries(mutate: (entries: Map<string, RelationshipEntry>) => void): void {
    this._entries.update((current) => {
      const next = new Map(current);
      mutate(next);
      return next;
    });
  }

  private memoize<T>(
    cache: Map<string, Signal<T>>,
    key: string,
    compute: () => T,
  ): Signal<T> {
    let cached = cache.get(key);
    if (!cached) {
      cached = computed(compute);
      cache.set(key, cached);
    }
    return cached;
  }
}
