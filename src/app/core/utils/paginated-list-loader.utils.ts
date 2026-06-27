import { Observable, catchError, finalize, map, of, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AppError } from '../models/app-error.model';
import { PaginatedResponse } from '../models/paginated-response.model';
import { PaginatedListState } from '../state/paginated-list.state';
import { LoggerService } from '../services/logger.service';
import { toAppError } from './app-error.utils';

export interface ScopeKeyHolder {
  get(): string | null;
  set(key: string): void;
}

export interface LoadPaginatedPageConfig<TDto, TItem> {
  reset: boolean;
  scopeKey?: string;
  currentScopeKey?: ScopeKeyHolder;
  state: PaginatedListState<TItem>;
  fetch: (cursor?: string) => Observable<PaginatedResponse<TDto>>;
  mapItems: (items: TDto[]) => TItem[];
  logContext: string;
  logger: LoggerService;
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
    scopeKey,
    currentScopeKey,
    state,
    fetch,
    mapItems,
    logContext,
    logger,
  } = config;

  if (currentScopeKey) {
    if (!scopeKey) {
      return of(void 0);
    }

    if (reset) {
      currentScopeKey.set(scopeKey);
      resetPaginatedListState(state);
    } else if (currentScopeKey.get() !== scopeKey) {
      return of(void 0);
    }
  } else if (reset) {
    resetPaginatedListState(state);
  }

  if (!reset && !state.cursor() && state.items().length > 0) {
    return of(void 0);
  }

  state.loading.set(true);
  state.error.set(null);

  const cursor = reset ? undefined : (state.cursor() ?? undefined);

  return fetch(cursor).pipe(
    tap((response) => {
      const mapped = mapItems(response.items);
      state.items.update((prev) => [...prev, ...mapped]);
      state.cursor.set(response.nextCursor);
      state.hasMore.set(response.nextCursor !== null);
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
    finalize(() => state.loading.set(false))
  );
}
