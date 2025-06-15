// src/app/features/settings/scopes/scopes.component.ts
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil, finalize } from 'rxjs';

import { DataTableComponent } from '../../../shared/components/data-table/data-table.component';
import { ScopeFormComponent, ScopeFormData } from '../../../shared/components/scope-form/scope-form.component';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { ScopeService } from '../../../core/services/scope.service';
import { Scope, CreateScopeRequest, UpdateScopeRequest } from '../../../core/models/scope.model';
import { TableColumn, TableAction } from '../../../core/models/table.model';
import { NotificationService } from '../../../core/services/base-api.service';

@Component({
  selector: 'app-scopes',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './scopes.component.html',
  styleUrls: ['./scopes.component.scss'],
  imports: [
    CommonModule,
    MatCardModule,
    TranslateModule,
    DataTableComponent,
  ]
})
export class ScopesComponent implements OnInit, OnDestroy {
  scopes: Scope[] = [];
  isLoading = false;
  private destroy$ = new Subject<void>();

  tableColumns: TableColumn[] = [
    { key: 'rank', label: 'scopes.rank', sortable: true, type: 'number' },
    { key: 'name', label: 'scopes.name', sortable: true, type: 'text' },
    { key: 'description', label: 'scopes.description', sortable: true, type: 'text' },
    { key: 'comment', label: 'scopes.comment', sortable: false, type: 'text' },
    { key: 'condition', label: 'scopes.condition', sortable: false, type: 'text' },
    { key: 'createdAt', label: 'profile.created_at', sortable: true, type: 'date' }
  ];

  tableActions: TableAction[] = [
    {
      icon: 'edit',
      label: 'common.edit',
      color: 'primary',
      action: (scope: Scope) => this.openEditDialog(scope)
    },
    {
      icon: 'delete',
      label: 'common.delete',
      color: 'warn',
      action: (scope: Scope) => this.confirmDeleteScope(scope)
    }
  ];

  constructor(
    private scopeService: ScopeService,
    private notificationService: NotificationService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadScopes();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadScopes() {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.cdr.markForCheck();

    this.scopeService.getAll()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.scopes = [...response.data];
            this.cdr.markForCheck();
          } else {
            this.scopes = [];
            this.notificationService.showError('common.error');
          }
        },
        error: (error) => {
          console.error('Erreur lors du chargement des scopes:', error);
          this.scopes = [];
          this.notificationService.showError('common.error');
          this.cdr.markForCheck();
        }
      });
  }

  openCreateDialog() {
    const nextRank = this.scopeService.getNextAvailableRank();

    const dialogRef = this.dialog.open(ScopeFormComponent, {
      width: '500px',
      disableClose: true,
      data: {
        mode: 'create',
        nextAvailableRank: nextRank
      } as ScopeFormData
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result) {
          this.createScope(result);
        }
      });
  }

  openEditDialog(scope: Scope) {
    const nextRank = this.scopeService.getNextAvailableRank();

    const dialogRef = this.dialog.open(ScopeFormComponent, {
      width: '500px',
      disableClose: true,
      data: {
        mode: 'edit',
        scope: { ...scope },
        nextAvailableRank: nextRank
      } as ScopeFormData
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result) {
          this.updateScope(result);
        }
      });
  }

  confirmDeleteScope(scope: Scope) {
    const dialogData: ConfirmationDialogData = {
      title: 'Confirmer la suppression',
      message: `Êtes-vous sûr de vouloir supprimer le scope "${scope.name}" (rang ${scope.rank}) ?`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      type: 'danger'
    };

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: dialogData
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result) {
          this.deleteScope(scope);
        }
      });
  }

  createScope(scopeData: CreateScopeRequest) {
    this.isLoading = true;
    this.cdr.markForCheck();

    this.scopeService.create(scopeData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.notificationService.showSuccess('common.success');
            this.loadScopes();
          } else {
            this.notificationService.showError(response.message || 'common.error');
          }
        },
        error: (error) => {
          console.error('Erreur lors de la création du scope:', error);
          this.notificationService.showError('common.error');
        }
      });
  }

  updateScope(scopeData: UpdateScopeRequest) {
    this.isLoading = true;
    this.cdr.markForCheck();

    this.scopeService.update(scopeData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.notificationService.showSuccess('common.success');
            this.loadScopes();
          } else {
            this.notificationService.showError(response.message || 'common.error');
          }
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour du scope:', error);
          this.notificationService.showError('common.error');
        }
      });
  }

  private deleteScope(scope: Scope) {
    this.isLoading = true;
    this.cdr.markForCheck();

    this.scopeService.delete(scope.id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.notificationService.showSuccess('common.success');
            this.loadScopes();
          } else {
            this.notificationService.showError(response.message || 'common.error');
          }
        },
        error: (error) => {
          console.error('Erreur lors de la suppression du scope:', error);
          this.notificationService.showError('common.error');
        }
      });
  }

  trackByScope(index: number, scope: Scope): string {
    return scope.id;
  }
}