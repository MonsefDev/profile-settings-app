// src/app/shared/components/rank-input/rank-input.component.ts
import { Component, Input, forwardRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-rank-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './rank-input.component.html',
  styleUrls: ['./rank-input.component.scss'],
  imports: [CommonModule, MatFormFieldModule, MatInputModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RankInputComponent),
      multi: true
    }
  ]
})
export class RankInputComponent implements ControlValueAccessor {
  @Input() label = 'Rang';
  @Input() placeholder = '';
  @Input() hint = 'Valeur entre 0 et 999';

  value: string = '';

  private onChange = (value: any) => {};
  private onTouched = () => {};

  constructor(private cdr: ChangeDetectorRef) {}

  onInput(event: any) {
    let inputValue = event.target.value;

    // Filtrer pour ne garder que les chiffres
    inputValue = inputValue.replace(/\D/g, '');

    // Limiter à 3 chiffres
    if (inputValue.length > 3) {
      inputValue = inputValue.slice(0, 3);
    }

    // Supprimer les zéros non significatifs (sauf si c'est juste "0")
    if (inputValue.length > 1) {
      inputValue = parseInt(inputValue, 10).toString();
    }

    // Vérifier que la valeur est dans la plage 0-999
    const numValue = parseInt(inputValue, 10);
    if (!isNaN(numValue) && numValue > 999) {
      inputValue = '999';
    }

    this.value = inputValue;
    event.target.value = inputValue;
    this.onChange(inputValue ? parseInt(inputValue, 10) : null);
    this.cdr.markForCheck();
  }

  onKeyDown(event: KeyboardEvent) {
    // Autoriser les touches de navigation
    const allowedKeys = [
      'Backspace', 'Tab', 'ArrowLeft', 'ArrowRight',
      'Delete', 'Home', 'End', 'Enter'
    ];

    // Autoriser les chiffres
    const isNumber = /^[0-9]$/.test(event.key);

    if (!isNumber && !allowedKeys.includes(event.key)) {
      event.preventDefault();
    }
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();

    const pasteData = event.clipboardData?.getData('text') || '';
    let cleanData = pasteData.replace(/\D/g, ''); // Supprimer tout ce qui n'est pas un chiffre

    // Garder seulement les 3 premiers chiffres
    if (cleanData.length > 3) {
      cleanData = cleanData.slice(0, 3);
    }

    // Supprimer les zéros non significatifs
    if (cleanData.length > 1) {
      cleanData = parseInt(cleanData, 10).toString();
    }

    // Vérifier la plage
    const numValue = parseInt(cleanData, 10);
    if (!isNaN(numValue) && numValue > 999) {
      cleanData = '999';
    }

    this.value = cleanData;
    const inputElement = event.target as HTMLInputElement;
    inputElement.value = cleanData;
    this.onChange(cleanData ? parseInt(cleanData, 10) : null);
    this.cdr.markForCheck();
  }

  onBlur() {
    this.onTouched();
  }

  // Implémentation ControlValueAccessor
  writeValue(value: any): void {
    this.value = value != null ? value.toString() : '';
    this.cdr.markForCheck();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Implémentation si nécessaire
  }
}