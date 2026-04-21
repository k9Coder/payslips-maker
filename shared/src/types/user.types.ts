export interface IUser {
  _id: string;
  clerkId: string;
  email: string;
  fullName: string;
  phone?: string;
  isAdmin: boolean;
  hasSubscription: boolean;
  employerName?: Record<string, string>;
  employerTaxId?: string;
  employerAddress?: string;
  employerCity?: string;
  employerZip?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface UpdateUserDto {
  fullName?: string;
  phone?: string;
  employerName?: Record<string, string>;
  employerTaxId?: string;
  employerAddress?: string;
  employerCity?: string;
  employerZip?: string;
}

export interface AdminUserView extends IUser {
  formCount: number;
}
