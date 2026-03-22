export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
}

export interface AdminFormsQuery {
  userId?: string;
  month?: number;
  year?: number;
  sortBy?: 'updatedAt' | 'netSalary' | 'grossSalary' | 'employeeName';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
