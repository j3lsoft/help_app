import { HttpErrorResponse } from '@angular/common/http';
import {
  AppError,
  ServerValidationErrorItem,
  ValidationErrorDetails,
} from '../models/app-error.model';
import {
  ServerValidationErrorBody,
} from '../utils/server-validation-errors.utils';

export class HttpErrorAdapter {
  static adapt(error: HttpErrorResponse): AppError {
    const code = error.error?.code;
    const message = error.error?.message;
    const validation = HttpErrorAdapter.extractValidationDetails(error.error);
    const baseDetails =
      error.error?.details && typeof error.error.details === 'object'
        ? error.error.details
        : undefined;

    return {
      status: error.status,
      code: typeof code === 'string' ? code : undefined,
      message: typeof message === 'string' ? message : undefined,
      details: {
        ...(baseDetails ?? {}),
        ...(validation ? { validation } : {}),
      },
      handled: false,
    };
  }

  private static extractValidationDetails(
    body: unknown
  ): ValidationErrorDetails | null {
    if (!body || typeof body !== 'object') return null;
    const maybe = body as ServerValidationErrorBody;
    if (!maybe.errors || typeof maybe.errors !== 'object') return null;

    const fieldErrors: Record<string, ServerValidationErrorItem[]> = {};
    for (const [key, value] of Object.entries(maybe.errors)) {
      if (!Array.isArray(value)) continue;

      const items = value
        .map((entry) => HttpErrorAdapter.normalizeValidationEntry(entry))
        .filter((entry): entry is ServerValidationErrorItem => !!entry);
      if (items.length > 0) fieldErrors[key] = items;
    }

    if (Object.keys(fieldErrors).length === 0) return null;
    return {
      message: typeof maybe.message === 'string' ? maybe.message : undefined,
      fieldErrors,
    };
  }

  private static normalizeValidationEntry(
    entry: unknown
  ): ServerValidationErrorItem | null {
    if (typeof entry === 'string') {
      return { message: entry };
    }

    if (!entry || typeof entry !== 'object') {
      return null;
    }

    const maybe = entry as { message?: unknown; meta?: unknown };
    if (typeof maybe.message !== 'string') {
      return null;
    }

    const normalized: ServerValidationErrorItem = { message: maybe.message };
    if (maybe.meta && typeof maybe.meta === 'object' && !Array.isArray(maybe.meta)) {
      normalized.meta = maybe.meta as Record<string, unknown>;
    }
    return normalized;
  }
}