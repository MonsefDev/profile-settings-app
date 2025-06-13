// src/app/core/services/user-context.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserContext } from '../models/user-context.model';

@Injectable({
  providedIn: 'root'
})
export class UserContextService {
  private userContextSubject = new BehaviorSubject<UserContext>({
    id: 'user_001',
    username: 'BUSINESS_ANALYST',
    scopes: ['USER_MANAGEMENT', 'SYSTEM_CONFIG', 'DATA_ACCESS'],
    hasRank3Scope: true // Simulation d'un utilisateur avec scope de rang 3
  });

  public userContext$ = this.userContextSubject.asObservable();

  getCurrentUser(): UserContext {
    return this.userContextSubject.value;
  }

  hasScope(scopeName: string): boolean {
    return this.userContextSubject.value.scopes.includes(scopeName);
  }

  hasRank3Scope(): boolean {
    return this.userContextSubject.value.hasRank3Scope;
  }

  updateUserScopes(scopes: string[]) {
    const currentUser = this.userContextSubject.value;
    const hasRank3 = scopes.includes('DATA_ACCESS'); // Simulation: DATA_ACCESS est le scope de rang 3

    this.userContextSubject.next({
      ...currentUser,
      scopes,
      hasRank3Scope: hasRank3
    });
  }

  // Méthode pour simuler différents utilisateurs
  simulateUser(hasRank3: boolean = true) {
    const currentUser = this.userContextSubject.value;
    this.userContextSubject.next({
      ...currentUser,
      hasRank3Scope: hasRank3,
      scopes: hasRank3
        ? ['USER_MANAGEMENT', 'SYSTEM_CONFIG', 'DATA_ACCESS']
        : ['USER_MANAGEMENT', 'SYSTEM_CONFIG']
    });
  }
}