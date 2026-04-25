import { AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * Validator that accepts either a valid email or a valid username.
 * Username: 3-20 chars, alphanumeric + underscore
 * Email: standard email format
 */
export function emailOrUsernameValidator(
  control: AbstractControl
): ValidationErrors | null {
  const value = control.value?.trim() || '';
  if (!value) return null;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;

  if (emailRegex.test(value) || usernameRegex.test(value)) {
    return null;
  }

  return { invalidEmailOrUsername: true };
}
