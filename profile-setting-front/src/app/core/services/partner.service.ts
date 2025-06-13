// src/app/core/services/partner.service.ts
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import {
  Partner,
  CreatePartnerRequest,
  UpdatePartnerRequest,
  PartnerStatus,
  HostingType,
  QUEUE_HOSTING_RULES
} from '../models/partner.model';
import { ApiResponse } from '../models/base.model';

@Injectable({
  providedIn: 'root'
})
export class PartnerService extends BaseApiService<Partner, CreatePartnerRequest, UpdatePartnerRequest> {
  protected entityName = 'Partner';

  private partnersSubject = new BehaviorSubject<Partner[]>([]);
  public partners$ = this.partnersSubject.asObservable();

  private mockPartners: Partner[] = [
    {
      id: '1',
      status: PartnerStatus.ACTIVE,
      hostingType: HostingType.MQ,
      alias: 'PAP_PARTNER',
      queueName: 'MQ_FROM_PAP_MSG',
      description: 'Partenaire principal pour le traitement PAP',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      lastModifiedBy: 'SYSTEM'
    },
    {
      id: '2',
      status: PartnerStatus.ACTIVE,
      hostingType: HostingType.S3,
      alias: 'KEMM_PARTNER',
      queueName: 'MQ_FROM_KEMM_WWIL_MSG',
      application: 'KEMM_PROCESSOR',
      description: 'Partenaire KEMM avec stockage S3',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      lastModifiedBy: 'SYSTEM'
    },
    {
      id: '3',
      status: PartnerStatus.INACTIVE,
      hostingType: HostingType.PRINTER,
      alias: 'PRINT_SERVICE',
      queueName: 'PRINTER_QUEUE_01',
      application: 'PRINT_MANAGER',
      description: 'Service d\'impression automatisé',
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
      lastModifiedBy: 'ADMIN'
    }
  ];

  // Mock des noms de files disponibles
  private mockQueueNames = [
    'MQ_FROM_PAP_MSG',
    'DIR_FLXTW094',
    'MQ_FROM_KEMM_WWIL_MSG',
    'MQ_STANDARD_QUEUE',
    'DIR_BACKUP_001',
    'S3_DATA_BUCKET',
    'PRINTER_QUEUE_01',
    'PRINTER_QUEUE_02',
    'MQ_PRIORITY_HIGH',
    'DIR_ARCHIVE_STORE',
    'S3_TEMP_STORAGE',
    'MQ_AUDIT_TRAIL',
    'DIR_INCOMING_FILES'
  ];

  constructor() {
    super();
    this.partnersSubject.next([...this.mockPartners]);
  }

  getAll(): Observable<ApiResponse<Partner[]>> {
    return this.simulateApiCall([...this.mockPartners]);
  }

  getById(id: string): Observable<ApiResponse<Partner>> {
    const partner = this.mockPartners.find(p => p.id === id);
    if (!partner) {
      return this.simulateApiCall(null as any, true);
    }
    return this.simulateApiCall(partner);
  }

  create(partnerRequest: CreatePartnerRequest): Observable<ApiResponse<Partner>> {
    // Vérifier l'unicité du queueName
    const exists = this.mockPartners.some(p => p.queueName === partnerRequest.queueName);
    if (exists) {
      return this.simulateApiCall(null as any, true);
    }

    const newPartner: Partner = {
      id: this.generateId(),
      ...partnerRequest,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastModifiedBy: 'CURRENT_USER'
    };

    this.mockPartners.push(newPartner);
    this.partnersSubject.next([...this.mockPartners]);

    return this.simulateApiCall(newPartner);
  }

  update(updateRequest: UpdatePartnerRequest): Observable<ApiResponse<Partner>> {
    const index = this.mockPartners.findIndex(p => p.id === updateRequest.id);
    if (index === -1) {
      return this.simulateApiCall(null as any, true);
    }

    // Vérifier l'unicité du queueName (exclure l'élément actuel)
    const exists = this.mockPartners.some(p =>
      p.queueName === updateRequest.queueName && p.id !== updateRequest.id
    );
    if (exists) {
      return this.simulateApiCall(null as any, true);
    }

    const updatedPartner = {
      ...this.mockPartners[index],
      ...updateRequest,
      updatedAt: new Date(),
      lastModifiedBy: 'CURRENT_USER'
    };

    this.mockPartners[index] = updatedPartner;
    this.partnersSubject.next([...this.mockPartners]);

    return this.simulateApiCall(updatedPartner);
  }

  delete(id: string): Observable<ApiResponse<boolean>> {
    const index = this.mockPartners.findIndex(p => p.id === id);
    if (index === -1) {
      return this.simulateApiCall(false, true);
    }

    this.mockPartners.splice(index, 1);
    this.partnersSubject.next([...this.mockPartners]);

    return this.simulateApiCall(true);
  }

  // Méthode pour obtenir les noms de files avec recherche
  getQueueNames(searchTerm?: string): Observable<string[]> {
    let filteredQueues = [...this.mockQueueNames];

    if (searchTerm) {
      filteredQueues = this.mockQueueNames.filter(name =>
        name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return of(filteredQueues).pipe(delay(300)); // Simulation d'appel API
  }

  // Méthode pour obtenir les types d'hébergement autorisés selon la file
  getAllowedHostingTypes(queueName: string): HostingType[] {
    const rule = QUEUE_HOSTING_RULES.find(rule => rule.queueName === queueName);
    return rule ? rule.allowedHostingTypes : Object.values(HostingType);
  }

  // Méthode pour rechercher des partners
  searchPartners(searchTerm: string): Partner[] {
    if (!searchTerm.trim()) return [...this.mockPartners];

    const term = searchTerm.toLowerCase();
    return this.mockPartners.filter(partner =>
      partner.alias.toLowerCase().includes(term) ||
      partner.queueName.toLowerCase().includes(term) ||
      partner.description.toLowerCase().includes(term) ||
      partner.application?.toLowerCase().includes(term) ||
      partner.status.toLowerCase().includes(term) ||
      partner.hostingType.toLowerCase().includes(term)
    );
  }

  // Vérifier si un nom de file est unique
  isQueueNameUnique(queueName: string, excludeId?: string): boolean {
    return !this.mockPartners.some(p =>
      p.queueName === queueName && p.id !== excludeId
    );
  }

  private generateId(): string {
    return `partner_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}