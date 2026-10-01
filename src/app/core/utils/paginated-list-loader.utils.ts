import { Observable, catchError, finalize, map, of, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AppError } from '../models/app-error.model';
import { PaginatedResponse } from '../models/paginated-response.model';
import { PaginatedListState } from '../state/paginated-list.state';
import { LoggerService } from '../services/logger.service';
import { toAppError } from './app-error.utils';

interface ScopeKeyHolder {
  get(): string | null;
  set(key: string): void;
}

interface LoadPaginatedPageConfig<TDto, TItem> {
  reset: boolean;
  /**
   * With `reset`, keep the current items visible until the first page arrives
   * (stale-while-revalidate) instead of clearing them and showing a loader.
   */
  soft?: boolean;
  scopeKey?: string;
  currentScopeKey?: ScopeKeyHolder;
  state: PaginatedListState<TItem>;
  fetch: (cursor?: string) => Observable<PaginatedResponse<TDto>>;
  mapItems: (items: TDto[]) => TItem[];
  logContext: string;
  logger: LoggerService;
  onTotal?: (total: number) => void;
}

function resetPaginatedListState<TItem>(state: PaginatedListState<TItem>): void {
  state.cursor.set(null);
  state.items.set([]);
  state.hasMore.set(false);
}

export function loadPaginatedPage<TDto, TItem>(
  config: LoadPaginatedPageConfig<TDto, TItem>
): Observable<void> {
  const {
    reset,
    soft = false,
    scopeKey,
    currentScopeKey,
    state,
    fetch,
    mapItems,
    logContext,
    logger,
    onTotal,
  } = config;

  if (currentScopeKey) {
    if (!scopeKey) {
      return of(void 0);
    }

    if (reset && !soft) {
      currentScopeKey.set(scopeKey);
      resetPaginatedListState(state);
    } else if (!reset && currentScopeKey.get() !== scopeKey) {
      return of(void 0);
    }
  } else if (reset && !soft) {
    resetPaginatedListState(state);
  }

  if (!reset && !state.cursor() && state.items().length > 0) {
    return of(void 0);
  }

  if (!soft) {
    state.loading.set(true);
  }
  state.error.set(null);

  const cursor = reset ? undefined : (state.cursor() ?? undefined);

  return fetch(cursor).pipe(
    tap((response) => {
      const mapped = mapItems(response.items);
      if (reset) {
        state.items.set(mapped);
      } else {
        state.items.update((prev) => [...prev, ...mapped]);
      }
      state.cursor.set(response.nextCursor);
      state.hasMore.set(response.nextCursor !== null);
      if (onTotal && typeof response.total === 'number') {
        onTotal(response.total);
      }
    }),
    map(() => void 0),
    catchError((error: unknown) => {
      const appError = toAppError(error);
      logger.error(`Failed to load ${logContext}`, {
        context: 'PaginatedListLoader',
        data: { scopeKey, error: appError },
      });
      state.error.set(appError);
      return throwError(() => appError);
    }),
    finalize(() => {
      if (!soft) {
        state.loading.set(false);
      }
    })
  );
}
