import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class ScopeValidators {

  static scopeRank(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value === null || value === undefined) return null;

      const numValue = Number(value);
      if (isNaN(numValue) || numValue < 0 || numValue > 999) {
        return { rankRange: true };
      }

      return null;
    };
  }
}