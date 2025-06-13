import { BaseEntity } from './base.model';

export enum PartnerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export enum HostingType {
  MQ = 'MQ',
  DIRECTORY = 'DIRECTORY',
  PRINTER = 'PRINTER',
  S3 = 'S3'
}

export interface Partner extends BaseEntity {
  status: PartnerStatus;
  hostingType: HostingType;
  alias: string;
  queueName: string;
  application?: string;
  description: string;
}

export interface CreatePartnerRequest {
  status: PartnerStatus;
  hostingType: HostingType;
  alias: string;
  queueName: string;
  application?: string;
  description: string;
}

export interface UpdatePartnerRequest extends CreatePartnerRequest {
  id: string;
}

// Règles spéciales pour les queues
export interface QueueRule {
  queueName: string;
  allowedHostingTypes: HostingType[];
}

export const QUEUE_HOSTING_RULES: QueueRule[] = [
  {
    queueName: 'MQ_FROM_PAP_MSG',
    allowedHostingTypes: [HostingType.DIRECTORY, HostingType.MQ]
  },
  {
    queueName: 'DIR_FLXTW094',
    allowedHostingTypes: [HostingType.DIRECTORY, HostingType.MQ]
  },
  {
    queueName: 'MQ_FROM_KEMM_WWIL_MSG',
    allowedHostingTypes: [HostingType.S3]
  }
];