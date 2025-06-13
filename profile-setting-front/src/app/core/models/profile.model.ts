import { BaseEntity } from './base.model';

export interface Profile extends BaseEntity {
  code: string;
  description: string;
  scopes: string[];
}

export interface CreateProfileRequest {
  code: string;
  description: string;
  scopes: string[];
}

export interface UpdateProfileRequest extends CreateProfileRequest {
  id: string;
}