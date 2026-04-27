import { AbstractControl, FormGroup } from '@angular/forms';
import { AppError, ServerValidationErrorItem } from '../models/app-error.model';

export interface ServerValidationErrorBody {
  statusCode?: number;
  message?: string;
  errors?: Record<string, ServerValidationErrorFieldEntry[]>;
}

export type ServerValidationErrorFieldEntry =
  | string
  | {
      message?: unknown;
      meta?: unknown;
    };

const VALIDATION_STATUSES = new Set([400, 422]);

export function isServerValidationError(error: AppError): error is AppError {
  const e = error;
  const validation = e.details?.validation;
  if (!VALIDATION_STATUSES.has(error.status)) return false;

  if (!validation || typeof validation !== 'object') return false;
  if (!validation.fieldErrors || typeof validation.fieldErrors !== 'object') {
    return false;
  }

  const fieldEntries = Object.values(validation.fieldErrors);
  return (
    fieldEntries.length > 0 &&
    fieldEntries.every(
      (items) =>
        Array.isArray(items) &&
        items.every(
          (item) =>
            !!item &&
            typeof item.message === 'string' &&
            item.message.length > 0
        )
    )
  );
}

export interface ApplyServerValidationErrorsOptions {
  /**
   * Key used to attach server-side error messages to a control.
   * This codebase already uses `serverError` in some forms.
   */
  controlErrorKey?: string;
  /**
   * Optional mapping between backend field names and form control names.
   * Example: { email: 'emailOrUsername' }
   */
  controlNameByServerField?: Record<string, string>;
  /** Marks controls as touched after setting errors. Default: true. */
  markTouched?: boolean;
  /**
   * Optional field message formatter for dynamic server messages.
   * When not provided, `item.message` is rendered as-is.
   */
  messageFormatter?: (context: {
    serverField: string;
    controlName: string;
    item: ServerValidationErrorItem;
  }) => string;
}

export function applyServerValidationErrors<
  TControls extends Record<string, AbstractControl>
>(
  form: FormGroup<TControls>,
  error: AppError,
  options: ApplyServerValidationErrorsOptions = {}
): void {
  if (!isServerValidationError(error)) return;

  const {
    controlErrorKey = 'serverError',
    controlNameByServerField = {},
    markTouched = true,
  } = options;

  const fieldErrors = error.details?.validation?.fieldErrors ?? {};

  for (const [serverField, messages] of Object.entries(fieldErrors)) {
    const controlName = controlNameByServerField[serverField] ?? serverField;
    const control = form.get(controlName);
    if (!control) continue;

    const nextErrors = { ...(control.errors ?? {}) } as Record<string, unknown>;
    nextErrors[controlErrorKey] = messages
      .map((item) =>
        options.messageFormatter
          ? options.messageFormatter({ serverField, controlName, item })
          : item.message
      )
      .join('\n');
    nextErrors[`${controlErrorKey}Meta`] = messages.map((item) => item.meta);
    control.setErrors(nextErrors);
    if (markTouched) control.markAsTouched();
  }
}

export function clearServerFieldErrors<
  TControls extends Record<string, AbstractControl>
>(
  form: FormGroup<TControls>,
  options: Pick<ApplyServerValidationErrorsOptions, 'controlErrorKey'> = {}
): void {
  const { controlErrorKey = 'serverError' } = options;
  const controlMetaKey = `${controlErrorKey}Meta`;

  for (const control of Object.values(form.controls)) {
    if (
      !control?.errors?.[controlErrorKey] &&
      !control?.errors?.[controlMetaKey]
    )
      continue;
    const next = { ...(control.errors ?? {}) } as Record<string, unknown>;
    delete next[controlErrorKey];
    delete next[controlMetaKey];
    control.setErrors(Object.keys(next).length ? next : null);
  }
}
