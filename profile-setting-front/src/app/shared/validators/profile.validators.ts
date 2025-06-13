// src/app/shared/validators/profile.validators.ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class ProfileValidators {

  static profileCode(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const errors: ValidationErrors = {};

      // Longueur entre 5 et 10 caractères
      if (value.length < 5 || value.length > 10) {
        errors['codeLength'] = true;
      }

      // Pas d'espaces ni de caractères interdits: ", #, !, &, _
      if (/[\s"#!&_]/.test(value)) {
        errors['codeFormat'] = true;
      }

      // Pas uniquement des chiffres
      if (/^\d+$/.test(value)) {
        errors['codeNotOnlyNumbers'] = true;
      }

      return Object.keys(errors).length > 0 ? errors : null;
    };
  }

  static profileDescription(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      if (value.length < 10 || value.length > 30) {
        return { descriptionLength: true };
      }

      return null;
    };
  }
}