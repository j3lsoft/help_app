import { AbstractControl } from '@angular/forms';

export function isInvalid(control: AbstractControl): boolean {
  return control.invalid && (control.dirty || control.touched);
}