import { signal, WritableSignal } from '@angular/core';
import { AppError } from '../models/app-error.model';

export interface PaginatedListState<TItem> {
  items: WritableSignal<TItem[]>;
  cursor: WritableSignal<string | null>;
  hasMore: WritableSignal<boolean>;
  loading: WritableSignal<boolean>;
  error: WritableSignal<AppError | null>;
}

export function createPaginatedListState<TItem>(): PaginatedListState<TItem> {
  return {
    items: signal<TItem[]>([]),
    cursor: signal<string | null>(null),
    hasMore: signal(false),
    loading: signal(false),
    error: signal<AppError | null>(null),
  };
}
