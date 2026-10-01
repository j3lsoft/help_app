import { AbstractControl, FormGroup } from '@angular/forms';
import { ErrorMapConfig } from '../errors/error-map.interface';
import type { ErrorMessageFacade } from '../errors/facades/error.facade';
import { AppError } from '../models/app-error.model';
import { toAppError } from './app-error.utils';
import {
  ApplyServerValidationErrorsOptions,
  applyServerValidationErrors,
  isServerValidationError,
} from './server-validation-errors.utils';

export function handleInlineFormError<
  TControls extends Record<string, AbstractControl>
>(params: {
  error: unknown;
  form: FormGroup<TControls>;
  config: ErrorMapConfig;
  facade: ErrorMessageFacade;
  validationOptions?: ApplyServerValidationErrorsOptions;
}): void {
  const appError = toAppError(params.error);
  if (isServerValidationError(appError)) {
    applyServerValidationErrors(
      params.form,
      appError,
      params.validationOptions
    );
    return;
  }

  params.facade.handle(appError, params.config);
}
