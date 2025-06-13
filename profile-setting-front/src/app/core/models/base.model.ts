export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  lastModifiedBy: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}