import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validator to check if the user is at least the specified minimum age.
 * @param getMinAgeYears Function that returns the minimum age in years
 * @returns Validator function
 */
export function birthDateMinAgeValidator(
  getMinAgeYears: () => number
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const minAgeYears = Number(getMinAgeYears() ?? 0);
    const value = String(control.value ?? '');
    if (!value || minAgeYears <= 0) {
      return null;
    }

    const birth = new Date(value);
    if (Number.isNaN(birth.getTime())) {
      return { invalidBirthDate: true };
    }

    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    const adjustedAge =
      m < 0 || (m === 0 && today.getDate() < birth.getDate()) ? age - 1 : age;
    return adjustedAge >= minAgeYears ? null : { underAge: true };
  };
}
