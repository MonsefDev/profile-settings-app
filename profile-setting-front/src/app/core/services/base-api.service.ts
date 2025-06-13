// src/app/core/services/base-api.service.ts
import { Observable, of, delay, throwError } from 'rxjs';
import { ApiResponse } from '../models/base.model';

@Injectable({
  providedIn: 'root'
})
export abstract class BaseApiService<T, CreateT, UpdateT> {
  protected abstract entityName: string;
  protected simulateDelay = 1500; // Simulation délai API

  protected simulateApiCall<R>(data: R, shouldFail = false): Observable<ApiResponse<R>> {
    const willFail = shouldFail || Math.random() < 0.05; // 5% chance d'échec

    return of({
      success: !willFail,
      data: willFail ? null as any : data,
      message: willFail
        ? `Erreur lors de l'opération sur ${this.entityName}`
        : `${this.entityName} traité avec succès`
    }).pipe(delay(this.simulateDelay));
  }

  abstract getAll(): Observable<ApiResponse<T[]>>;
  abstract getById(id: string): Observable<ApiResponse<T>>;
  abstract create(entity: CreateT): Observable<ApiResponse<T>>;
  abstract update(entity: UpdateT): Observable<ApiResponse<T>>;
  abstract delete(id: string): Observable<ApiResponse<boolean>>;
}

// src/app/core/services/notification.service.ts
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {}

  showSuccess(message: string, params?: any) {
    const translatedMessage = this.translate.instant(message, params);
    this.snackBar.open(translatedMessage, '✕', {
      duration: 3000,
      panelClass: ['success-snackbar'],
      verticalPosition: 'top',
      horizontalPosition: 'right'
    });
  }

  showError(message: string, params?: any) {
    const translatedMessage = this.translate.instant(message, params);
    this.snackBar.open(translatedMessage, '✕', {
      duration: 5000,
      panelClass: ['error-snackbar'],
      verticalPosition: 'top',
      horizontalPosition: 'right'
    });
  }

  showWarning(message: string, params?: any) {
    const translatedMessage = this.translate.instant(message, params);
    this.snackBar.open(translatedMessage, '✕', {
      duration: 4000,
      panelClass: ['warning-snackbar'],
      verticalPosition: 'top',
      horizontalPosition: 'right'
    });
  }
}