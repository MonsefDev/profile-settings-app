import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { Scope, CreateScopeRequest, UpdateScopeRequest } from '../models/scope.model';
import { ApiResponse } from '../models/base.model';

@Injectable({
  providedIn: 'root'
})
export class ScopeService extends BaseApiService<Scope, CreateScopeRequest, UpdateScopeRequest> {
  protected entityName = 'Scope';

  private scopesSubject = new BehaviorSubject<Scope[]>([]);
  public scopes$ = this.scopesSubject.asObservable();

  private mockScopes: Scope[] = [
    {
      id: '1',
      rank: 1,
      name: 'USER_MANAGEMENT',
      description: 'Gestion des utilisateurs',
      comment: 'Permet la création et modification des utilisateurs',
      condition: 'hasRole("ADMIN")',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      lastModifiedBy: 'SYSTEM'
    },
    {
      id: '2',
      rank: 2,
      name: 'SYSTEM_CONFIG',
      description: 'Configuration système',
      comment: 'Accès aux paramètres système',
      condition: 'hasRole("ADMIN") && hasPermission("CONFIG")',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      lastModifiedBy: 'SYSTEM'
    },
    {
      id: '3',
      rank: 3,
      name: 'DATA_ACCESS',
      description: 'Accès aux données',
      comment: 'Lecture et écriture des données métier',
      condition: 'hasPermission("DATA_READ")',
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
      lastModifiedBy: 'SYSTEM'
    }
  ];

  constructor() {
    super();
    this.scopesSubject.next([...this.mockScopes]);
  }

  getAll(): Observable<ApiResponse<Scope[]>> {
    const sortedScopes = [...this.mockScopes].sort((a, b) => a.rank - b.rank);
    return this.simulateApiCall(sortedScopes);
  }

  getById(id: string): Observable<ApiResponse<Scope>> {
    const scope = this.mockScopes.find(s => s.id === id);
    if (!scope) {
      return this.simulateApiCall(null as any, true);
    }
    return this.simulateApiCall(scope);
  }

  create(scopeRequest: CreateScopeRequest): Observable<ApiResponse<Scope>> {
    // Gestion de l'échange automatique de rang
    this.handleRankExchange(scopeRequest.rank);

    const newScope: Scope = {
      id: this.generateId(),
      ...scopeRequest,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastModifiedBy: 'CURRENT_USER'
    };

    this.mockScopes.push(newScope);
    this.scopesSubject.next([...this.mockScopes]);

    return this.simulateApiCall(newScope);
  }

  update(updateRequest: UpdateScopeRequest): Observable<ApiResponse<Scope>> {
    const index = this.mockScopes.findIndex(s => s.id === updateRequest.id);
    if (index === -1) {
      return this.simulateApiCall(null as any, true);
    }

    // Gestion de l'échange de rang si changement
    const currentScope = this.mockScopes[index];
    if (updateRequest.rank !== currentScope.rank) {
      this.handleRankExchange(updateRequest.rank, updateRequest.id);
    }

    const updatedScope = {
      ...currentScope,
      ...updateRequest,
      updatedAt: new Date(),
      lastModifiedBy: 'CURRENT_USER'
    };

    this.mockScopes[index] = updatedScope;
    this.scopesSubject.next([...this.mockScopes]);

    return this.simulateApiCall(updatedScope);
  }

  delete(id: string): Observable<ApiResponse<boolean>> {
    const index = this.mockScopes.findIndex(s => s.id === id);
    if (index === -1) {
      return this.simulateApiCall(false, true);
    }

    this.mockScopes.splice(index, 1);
    this.scopesSubject.next([...this.mockScopes]);

    return this.simulateApiCall(true);
  }

  getNextAvailableRank(): number {
    if (this.mockScopes.length === 0) return 1;
    return Math.max(...this.mockScopes.map(s => s.rank)) + 1;
  }

  private handleRankExchange(newRank: number, excludeId?: string) {
    const existingScope = this.mockScopes.find(s =>
      s.rank === newRank && s.id !== excludeId
    );

    if (existingScope) {
      // Trouver le prochain rang disponible
      const maxRank = Math.max(...this.mockScopes.map(s => s.rank));
      existingScope.rank = maxRank + 1;
      existingScope.updatedAt = new Date();
      existingScope.lastModifiedBy = 'CURRENT_USER';
    }
  }

  private generateId(): string {
    return `scope_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}