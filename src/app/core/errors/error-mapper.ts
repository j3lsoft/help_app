import { AppError } from '../models/app-error.model';
import { ErrorMapConfig } from './error-map.interface';

export function mapError(error: AppError, config: ErrorMapConfig): string {
  if (error.code && config.byCode?.[error.code] !== undefined) {
    return config.byCode[error.code];
  }

  if (config.byStatus?.[error.status] !== undefined) {
    return config.byStatus[error.status];
  }

  return config.fallback;
}