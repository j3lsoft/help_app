export interface ErrorMapConfig {
  byCode?: Record<string, string>;
  byStatus?: Record<number, string>;
  fallback: string;
}