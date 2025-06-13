import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { Profile, CreateProfileRequest, UpdateProfileRequest } from '../models/profile.model';
import { ApiResponse } from '../models/base.model';

@Injectable({
  providedIn: 'root'
})
export class ProfileService extends BaseApiService<Profile, CreateProfileRequest, UpdateProfileRequest> {
  protected entityName = 'Profile';

  private profilesSubject = new BehaviorSubject<Profile[]>([]);
  public profiles$ = this.profilesSubject.asObservable();

  private mockProfiles: Profile[] = [
    {
      id: '1',
      code: 'ADMIN',
      description: 'Profil administrateur par défaut du système',
      scopes: ['USER_MANAGEMENT', 'SYSTEM_CONFIG'],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      lastModifiedBy: 'SYSTEM'
    }
  ];

  constructor() {
    super();
    this.profilesSubject.next([...this.mockProfiles]);
  }

  getAll(): Observable<ApiResponse<Profile[]>> {
    return this.simulateApiCall([...this.mockProfiles]);
  }

  getById(id: string): Observable<ApiResponse<Profile>> {
    const profile = this.mockProfiles.find(p => p.id === id);
    if (!profile) {
      return this.simulateApiCall(null as any, true);
    }
    return this.simulateApiCall(profile);
  }

  create(profileRequest: CreateProfileRequest): Observable<ApiResponse<Profile>> {
    // Vérifier l'unicité du code
    const exists = this.mockProfiles.some(p => p.code === profileRequest.code);
    if (exists) {
      return this.simulateApiCall(null as any, true);
    }

    const newProfile: Profile = {
      id: this.generateId(),
      ...profileRequest,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastModifiedBy: 'CURRENT_USER'
    };

    this.mockProfiles.push(newProfile);
    this.profilesSubject.next([...this.mockProfiles]);

    return this.simulateApiCall(newProfile);
  }

  update(updateRequest: UpdateProfileRequest): Observable<ApiResponse<Profile>> {
    const index = this.mockProfiles.findIndex(p => p.id === updateRequest.id);
    if (index === -1) {
      return this.simulateApiCall(null as any, true);
    }

    // Vérifier l'unicité du code (exclure l'élément actuel)
    const exists = this.mockProfiles.some(p =>
      p.code === updateRequest.code && p.id !== updateRequest.id
    );
    if (exists) {
      return this.simulateApiCall(null as any, true);
    }

    const updatedProfile = {
      ...this.mockProfiles[index],
      ...updateRequest,
      updatedAt: new Date(),
      lastModifiedBy: 'CURRENT_USER'
    };

    this.mockProfiles[index] = updatedProfile;
    this.profilesSubject.next([...this.mockProfiles]);

    return this.simulateApiCall(updatedProfile);
  }

  delete(id: string): Observable<ApiResponse<boolean>> {
    const index = this.mockProfiles.findIndex(p => p.id === id);
    if (index === -1) {
      return this.simulateApiCall(false, true);
    }

    // Empêcher la suppression du profil ADMIN
    if (this.mockProfiles[index].code === 'ADMIN') {
      return this.simulateApiCall(false, true);
    }

    this.mockProfiles.splice(index, 1);
    this.profilesSubject.next([...this.mockProfiles]);

    return this.simulateApiCall(true);
  }

  private generateId(): string {
    return `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}