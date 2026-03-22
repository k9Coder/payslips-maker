export interface IUser {
  _id: string;
  clerkId: string;
  email: string;
  fullName: string;
  phone?: string;
  isAdmin: boolean;
  employerName?: string;
  employerTaxId?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface UpdateUserDto {
  fullName?: string;
  phone?: string;
  employerName?: string;
  employerTaxId?: string;
}

export interface AdminUserView extends IUser {
  formCount: number;
}
