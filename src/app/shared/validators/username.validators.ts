import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validator for username format.
 * Only allows alphanumeric characters, dots, and underscores.
 * Cannot start or end with a dot, and cannot contain consecutive dots.
 * @returns Validator function
 */
export function usernameValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? '');
    if (!value) {
      return null;
    }
    if (!/^[a-zA-Z0-9._]+$/.test(value)) {
      return { usernameFormat: true };
    }
    if (value.startsWith('.') || value.endsWith('.')) {
      return { usernameDot: true };
    }
    if (value.includes('..')) {
      return { usernameDot: true };
    }
    return null;
  };
}
