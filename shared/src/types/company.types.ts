import type { MultiLangString } from './employee.types';

export interface ICompany {
  _id: string;
  name: MultiLangString;  // mandatory — company display name
  ein?: string;        // Employer Identification Number (מס' עוסק מורשה / ח.פ)
  logo?: string;       // URL to logo image
  address?: string;    // full address string
  phone?: string;      // company phone (appears in PDF header)
  website?: string;    // future use
  createdAt: Date | string;
  updatedAt: Date | string;
}

export type CreateCompanyDto = Omit<ICompany, '_id' | 'createdAt' | 'updatedAt'>;
export type UpdateCompanyDto = Partial<CreateCompanyDto>;
