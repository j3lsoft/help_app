import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validator to check that two password fields match.
 * @param passwordKey The control name for the password field
 * @param confirmKey The control name for the confirm password field
 * @returns Validator function
 */
export function matchPasswordsValidator(
  passwordKey: string,
  confirmKey: string
): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const password = group.get(passwordKey)?.value;
    const confirm = group.get(confirmKey)?.value;
    if (!password || !confirm) {
      return null;
    }
    return password === confirm ? null : { passwordsMismatch: true };
  };
}

/**
 * Validator to enforce password strength requirements.
 * Requires at least one number and one special character.
 * @returns Validator function
 */
export function passwordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? '');
    if (!value) {
      return null;
    }
    const hasNumber = /\d/.test(value);
    const hasSpecial = /[^a-zA-Z0-9]/.test(value);
    return hasNumber && hasSpecial ? null : { weakPassword: true };
  };
}
