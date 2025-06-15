// src/app/features/settings/partners/partners.component.ts
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil, finalize, catchError, of } from 'rxjs';

import { PartnerService } from '../../../core/services/partner.service';
import { UserContextService } from '../../../core/services/user-context.service';
import { Partner, CreatePartnerRequest, UpdatePartnerRequest, PartnerStatus } from '../../../core/models/partner.model';
import { TableColumn, TableAction } from '../../../core/models/table.model';
import { DataTableComponent } from '../../../shared/components/data-table/data-table.component';
import { NotificationService } from '../../../core/services/base-api.service';
import { PartnerFormComponent, PartnerFormData } from '../../../shared/components/partner-form/partner-form.component';

@Component({
  selector: 'app-partners',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatCardModule,
    TranslateModule,
    DataTableComponent,
  ],
  templateUrl: './partners.component.html',
  styleUrls: ['./partners.component.scss'],
})
export class PartnersComponent implements OnInit, OnDestroy {
  partners: Partner[] = [];
  isLoading = false;
  hasRank3Scope = false;

  private destroy$ = new Subject<void>();

  readonly tableColumns: TableColumn[] = [
    {
      key: 'status',
      label: 'partners.status',
      sortable: true,
      type: 'text'
    },
    {
      key: 'hostingType',
      label: 'partners.hosting_type',
      sortable: true,
      type: 'text'
    },
    {
      key: 'alias',
      label: 'partners.alias',
      sortable: true,
      type: 'text'
    },
    {
      key: 'queueName',
      label: 'partners.queue_name',
      sortable: true,
      type: 'text'
    },
    {
      key: 'application',
      label: 'partners.application',
      sortable: true,
      type: 'text'
    },
    {
      key: 'description',
      label: 'partners.description',
      sortable: false,
      type: 'text'
    },
    {
      key: 'createdAt',
      label: 'profile.created_at',
      sortable: true,
      type: 'date'
    }
  ];

  readonly tableActions: TableAction[] = [
    {
      icon: 'edit',
      label: 'common.edit',
      color: 'primary',
      action: (partner: Partner) => this.openEditDialog(partner)
    },
    {
      icon: 'delete',
      label: 'common.delete',
      color: 'warn',
      action: (partner: Partner) => this.deletePartner(partner)
    }
  ];

  constructor(
    private partnerService: PartnerService,
    private notificationService: NotificationService,
    private userContextService: UserContextService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.checkUserContext();
    this.loadPartners();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkUserContext() {
    this.userContextService.userContext$
      .pipe(takeUntil(this.destroy$))
      .subscribe(userContext => {
        const hadRank3 = this.hasRank3Scope;
        this.hasRank3Scope = userContext?.hasRank3Scope || false;

        if (hadRank3 !== this.hasRank3Scope) {
          this.cdr.markForCheck();
        }
      });
  }
  loadPartners() {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.cdr.markForCheck();

    this.partnerService.getAll()
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Erreur lors du chargement des partners:', error);
          this.notificationService.showError('Erreur lors du chargement des données');
          return of({ success: false, data: [] });
        }),
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            // ✅ CRITIQUE: Créer une nouvelle référence
            this.partners = [...response.data];

            // ✅ DEBUG: Ajouter ces logs temporaires
            console.log('🔄 PartnersComponent - Données chargées:', this.partners.length);
            console.log('🔄 PartnersComponent - Première donnée:', this.partners[0]);

            this.cdr.detectChanges(); // ✅ detectChanges au lieu de markForCheck
          } else {
            this.partners = [];
            if (response.success === false) {
              this.notificationService.showError('Aucune donnée disponible');
            }
          }
        }
      });
  }
  openCreateDialog() {
    const dialogRef = this.dialog.open(PartnerFormComponent, {
      width: '500px',
      disableClose: true,
      data: {
        mode: 'create'
      } as PartnerFormData
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result) {
          if (this.hasRank3Scope && !result.status) {
            result.status = PartnerStatus.ACTIVE;
          }
          this.createPartner(result);
        }
      });
  }

  openEditDialog(partner: Partner) {
    const dialogRef = this.dialog.open(PartnerFormComponent, {
      width: '600px',
      disableClose: true,
      data: {
        mode: 'edit',
        partner: { ...partner }
      } as PartnerFormData
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result) {
          this.updatePartner(result);
        }
      });
  }

  createPartner(partnerData: CreatePartnerRequest) {
    if (this.isLoading) return;

    this.isLoading = true;
    this.cdr.markForCheck();

    this.partnerService.create(partnerData)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Erreur lors de la création du partner:', error);
          this.notificationService.showError('Erreur lors de la création');
          return of({ success: false });
        }),
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.notificationService.showSuccess('Partner créé avec succès');
            this.loadPartners();
          } else {
            this.notificationService.showError(response.success || 'Erreur lors de la création');
          }
        }
      });
  }

  updatePartner(partnerData: UpdatePartnerRequest) {
    if (this.isLoading) return;

    this.isLoading = true;
    this.cdr.markForCheck();

    this.partnerService.update(partnerData)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Erreur lors de la mise à jour du partner:', error);
          this.notificationService.showError('Erreur lors de la mise à jour');
          return of({ success: false });
        }),
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.notificationService.showSuccess('Partner mis à jour avec succès');
            this.loadPartners();
          } else {
            this.notificationService.showError(response.success || 'Erreur lors de la mise à jour');
          }
        }
      });
  }

  deletePartner(partner: Partner) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce partner ?')) {
      return;
    }

    if (this.isLoading) return;

    this.isLoading = true;
    this.cdr.markForCheck();

    this.partnerService.delete(partner.id)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Erreur lors de la suppression du partner:', error);
          this.notificationService.showError('Erreur lors de la suppression');
          return of({ success: false });
        }),
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.notificationService.showSuccess('Partner supprimé avec succès');
            this.loadPartners();
          } else {
            this.notificationService.showError(response.success || 'Erreur lors de la suppression');
          }
        }
      });
  }

  trackByPartnerId(index: number, partner: Partner): string {
    return partner.id;
  }

  trackByColumnKey(index: number, column: TableColumn): string {
    return column.key;
  }

  trackByActionLabel(index: number, action: TableAction): string {
    return action.label;
  }
}