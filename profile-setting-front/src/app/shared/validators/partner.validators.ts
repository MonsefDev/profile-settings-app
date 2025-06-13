import { AbstractControl, ValidationErrors, ValidatorFn, AsyncValidatorFn } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export class PartnerValidators {

  static uniqueQueueName(existingQueueNames: string[], excludeId?: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const isDuplicate = existingQueueNames.some(name =>
        name.toLowerCase() === value.toLowerCase()
      );

      return isDuplicate ? { queueNameUnique: true } : null;
    };
  }
}