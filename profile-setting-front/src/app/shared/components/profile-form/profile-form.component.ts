// src/app/shared/components/profile-form/profile-form.component.ts
import { Component, Inject, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { Profile, CreateProfileRequest, UpdateProfileRequest } from '../../../core/models/profile.model';
import { ProfileValidators } from '../../validators/profile.validators';
import { MatIcon } from '@angular/material/icon';

export interface ProfileFormData {
  profile?: Profile;
  mode: 'create' | 'edit';
  availableScopes: string[];
}

@Component({
  selector: 'app-profile-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile-form.component.html',
  styleUrls: ['./profile-form.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    TranslateModule,
    MatIcon
  ]
})
export class ProfileFormComponent implements OnInit {
  profileForm!: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ProfileFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProfileFormData,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.createForm();

    if (this.data.mode === 'edit' && this.data.profile) {
      this.profileForm.patchValue(this.data.profile);
    }
  }

  private createForm() {
    this.profileForm = this.fb.group({
      code: ['', [
        Validators.required,
        ProfileValidators.profileCode()
      ]],
      description: ['', [
        Validators.required,
        ProfileValidators.profileDescription()
      ]],
      scopes: [[], Validators.required]
    });
  }

  onSubmit() {
    if (this.profileForm.valid) {
      this.isSubmitting = true;
      this.cdr.markForCheck();

      const formValue = this.profileForm.value;
      const result = this.data.mode === 'create'
        ? formValue as CreateProfileRequest
        : { ...formValue, id: this.data.profile!.id } as UpdateProfileRequest;

      setTimeout(() => {
        this.dialogRef.close(result);
      }, 1000);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  trackByScope(index: number, scope: string): string {
    return scope;
  }
}