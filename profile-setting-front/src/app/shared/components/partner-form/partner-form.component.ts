// src/app/shared/components/partner-form.component.ts
import { Component, Inject, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, Observable, startWith, map, takeUntil } from 'rxjs';
import {
  Partner,
  CreatePartnerRequest,
  UpdatePartnerRequest,
  PartnerStatus,
  HostingType,
  QUEUE_HOSTING_RULES
} from  '../../../core/models/partner.model';
import { UserContextService } from '../../../core/services/user-context.service';
import { PartnerService } from '../../../core/services/partner.service';

export interface PartnerFormData {
  partner?: Partner;
  mode: 'create' | 'edit';
}

@Component({
  selector: 'app-partner-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatAutocompleteModule,
    TranslateModule
  ],
 templateUrl: './partner-form.component.html',
 styleUrls: ['./partner-form.component.scss'],
 changeDetection: ChangeDetectionStrategy.OnPush,

})
export class PartnerFormComponent implements OnInit, OnDestroy {
  partnerForm!: FormGroup;
  isSubmitting = false;

  PartnerStatus = PartnerStatus;
  HostingType = HostingType;

  availableQueues: string[] = [];
  filteredQueues$!: Observable<string[]>;
  allowedHostingTypes: HostingType[] = Object.values(HostingType);
  selectedQueueName = '';
  hasQueueRestrictions = false;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private partnerService: PartnerService,
    private userContextService: UserContextService,
    public dialogRef: MatDialogRef<PartnerFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PartnerFormData
  ) {}

  ngOnInit() {
    this.createForm();
    this.loadQueueNames();
    this.setupFormWatchers();

    if (this.data.mode === 'edit' && this.data.partner) {
      this.partnerForm.patchValue(this.data.partner);
      this.selectedQueueName = this.data.partner.queueName;
      this.updateHostingTypesForQueue(this.data.partner.queueName);
    } else if (this.data.mode === 'create') {
      // Auto-définir le statut sur ACTIVE si l'utilisateur a un scope de rang 3
      const hasRank3 = this.userContextService.hasRank3Scope();
      if (hasRank3) {
        this.partnerForm.patchValue({ status: PartnerStatus.ACTIVE });
      }
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm() {
    this.partnerForm = this.fb.group({
      status: ['', Validators.required],
      queueName: ['', Validators.required],
      hostingType: ['', Validators.required],
      alias: ['', Validators.required],
      application: [''],
      description: ['', Validators.required]
    });
  }

  private loadQueueNames() {
    this.partnerService.getQueueNames()
      .pipe(takeUntil(this.destroy$))
      .subscribe((queues:any) => {
        this.availableQueues = queues;
        this.setupQueueAutocomplete();
      });
  }

  private setupQueueAutocomplete() {
    const queueControl = this.partnerForm.get('queueName')!;

    this.filteredQueues$ = queueControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        const filterValue = (value || '').toLowerCase();
        return this.availableQueues.filter(queue =>
          queue.toLowerCase().includes(filterValue)
        );
      })
    );
  }

  private setupFormWatchers() {
    // Watcher pour queueName
    this.partnerForm.get('queueName')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(queueName => {
        this.selectedQueueName = queueName;
        this.updateHostingTypesForQueue(queueName);
      });

    // Watcher pour hostingType
    this.partnerForm.get('hostingType')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(hostingType => {
        this.updateApplicationFieldVisibility(hostingType);
      });
  }

  private updateHostingTypesForQueue(queueName: string) {
    const allowedTypes = this.partnerService.getAllowedHostingTypes(queueName);
    this.allowedHostingTypes = allowedTypes;
    this.hasQueueRestrictions = allowedTypes.length < Object.values(HostingType).length;

    // Réinitialiser le hostingType si la valeur actuelle n'est plus autorisée
    const currentHostingType = this.partnerForm.get('hostingType')?.value;
    if (currentHostingType && !allowedTypes.includes(currentHostingType)) {
      this.partnerForm.patchValue({ hostingType: '' });
    }
  }

  private updateApplicationFieldVisibility(hostingType: HostingType) {
    const applicationControl = this.partnerForm.get('application')!;

    if (hostingType === HostingType.PRINTER || hostingType === HostingType.S3) {
      applicationControl.setValidators([Validators.required]);
    } else {
      applicationControl.setValidators([]);
      applicationControl.setValue('');
    }

    applicationControl.updateValueAndValidity();
  }

  get showApplicationField(): boolean {
    const hostingType = this.partnerForm.get('hostingType')?.value;
    return hostingType === HostingType.PRINTER || hostingType === HostingType.S3;
  }

  displayQueueName(queue: string): string {
    return queue || '';
  }

  onQueueSelected(event: any) {
    const selectedQueue = event.option.value;
    this.updateHostingTypesForQueue(selectedQueue);
  }

  onSubmit() {
    if (this.partnerForm.valid) {
      this.isSubmitting = true;

      const formValue = this.partnerForm.value;

      // Nettoyer les données
      const cleanedData = {
        ...formValue,
        alias: formValue.alias.trim(),
        queueName: formValue.queueName.trim(),
        description: formValue.description.trim(),
        application: formValue.application?.trim() || undefined
      };

      const result = this.data.mode === 'create'
        ? cleanedData as CreatePartnerRequest
        : { ...cleanedData, id: this.data.partner!.id } as UpdatePartnerRequest;

      setTimeout(() => {
        this.dialogRef.close(result);
      }, 1000);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}