import { FormControl, FormGroup } from '@angular/forms';
import { AppError } from '../models/app-error.model';
import {
  applyServerValidationErrors,
  isServerValidationError,
} from './server-validation-errors.utils';

describe('server-validation-errors.utils', () => {
  const validValidationError: AppError = {
    status: 422,
    handled: false,
    details: {
      validation: {
        fieldErrors: {
          email: [{ message: 'Invalid email' }],
        },
      },
    },
  };

  describe('isServerValidationError', () => {
    it('returns true for 400 with valid fieldErrors', () => {
      const error: AppError = { ...validValidationError, status: 400 };
      expect(isServerValidationError(error)).toBeTrue();
    });

    it('returns true for 422 with valid fieldErrors', () => {
      expect(isServerValidationError(validValidationError)).toBeTrue();
    });

    it('returns false for non-validation status codes', () => {
      const error: AppError = { ...validValidationError, status: 401 };
      expect(isServerValidationError(error)).toBeFalse();
    });

    it('returns false when fieldErrors is empty', () => {
      const error: AppError = {
        status: 422,
        handled: false,
        details: {
          validation: { fieldErrors: {} },
        },
      };
      expect(isServerValidationError(error)).toBeFalse();
    });

    it('returns false when validation is missing', () => {
      const error: AppError = {
        status: 422,
        handled: false,
        details: {},
      };
      expect(isServerValidationError(error)).toBeFalse();
    });

    it('returns false when message items are invalid', () => {
      const error: AppError = {
        status: 422,
        handled: false,
        details: {
          validation: {
            fieldErrors: {
              email: [{ message: '' }],
            },
          },
        },
      };
      expect(isServerValidationError(error)).toBeFalse();
    });
  });

  describe('applyServerValidationErrors', () => {
    it('sets serverError on matching form controls', () => {
      const form = new FormGroup({
        email: new FormControl(''),
      });

      applyServerValidationErrors(form, validValidationError);

      expect(form.get('email')?.errors?.['serverError']).toBe('Invalid email');
      expect(form.get('email')?.touched).toBeTrue();
    });

    it('does nothing when error is not a server validation error', () => {
      const form = new FormGroup({
        email: new FormControl(''),
      });
      const error: AppError = { status: 401, handled: false };

      applyServerValidationErrors(form, error);

      expect(form.get('email')?.errors).toBeNull();
    });
  });
});
