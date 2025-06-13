import { BaseEntity } from './base.model';

export interface Scope extends BaseEntity {
  rank: number;
  name: string;
  description: string;
  comment?: string;
  condition?: string;
}

export interface CreateScopeRequest {
  rank: number;
  name: string;
  description: string;
  comment?: string;
  condition?: string;
}

export interface UpdateScopeRequest extends CreateScopeRequest {
  id: string;
}