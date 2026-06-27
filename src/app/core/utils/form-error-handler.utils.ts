import { AbstractControl, FormGroup } from '@angular/forms';
import { AppError } from '../models/app-error.model';
import { toAppError } from './app-error.utils';
import {
  ApplyServerValidationErrorsOptions,
  applyServerValidationErrors,
  isServerValidationError,
} from './server-validation-errors.utils';

type ErrorMessageFacade<TContext> = {
  handle(error: AppError, context: TContext): void;
};

export function handleInlineFormError<
  TControls extends Record<string, AbstractControl>,
  TContext
>(params: {
  error: unknown;
  form: FormGroup<TControls>;
  context: TContext;
  facade: ErrorMessageFacade<TContext>;
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

  params.facade.handle(appError, params.context);
}
