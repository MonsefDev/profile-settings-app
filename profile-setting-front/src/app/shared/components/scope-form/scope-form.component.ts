// src/app/shared/components/scope-form/scope-form.component.ts
import { Component, Inject, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { RankInputComponent } from '../rank-input/rank-input.component';
import { Scope, CreateScopeRequest, UpdateScopeRequest } from '../../../core/models/scope.model';
import { ScopeValidators } from '../../validators/scope.validators';

export interface ScopeFormData {
  scope?: Scope;
  mode: 'create' | 'edit';
  nextAvailableRank: number;
}

@Component({
  selector: 'app-scope-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './scope-form.component.html',
  styleUrls: ['./scope-form.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    TranslateModule,
    RankInputComponent
  ]
})
export class ScopeFormComponent implements OnInit {
  scopeForm!: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ScopeFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ScopeFormData,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.createForm();

    if (this.data.mode === 'edit' && this.data.scope) {
      this.scopeForm.patchValue(this.data.scope);
    } else if (this.data.mode === 'create') {
      this.scopeForm.patchValue({ rank: this.data.nextAvailableRank });
    }
  }

  private createForm() {
    this.scopeForm = this.fb.group({
      rank: [null, [
        Validators.required,
        ScopeValidators.scopeRank()
      ]],
      name: ['', Validators.required],
      description: ['', Validators.required],
      comment: [''],
      condition: ['']
    });
  }

  onSubmit() {
    if (this.scopeForm.valid) {
      this.isSubmitting = true;
      this.cdr.markForCheck();

      const formValue = this.scopeForm.value;
      const result = this.data.mode === 'create'
        ? formValue as CreateScopeRequest
        : { ...formValue, id: this.data.scope!.id } as UpdateScopeRequest;

      setTimeout(() => {
        this.dialogRef.close(result);
      }, 1000);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}