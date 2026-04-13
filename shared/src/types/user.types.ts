export interface IUser {
  _id: string;
  clerkId: string;
  email: string;
  fullName: string;
  phone?: string;
  isAdmin: boolean;
  hasSubscription: boolean;
  companyIds: string[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface UpdateUserDto {
  fullName?: string;
  phone?: string;
}

export interface AdminUserView extends IUser {
  formCount: number;
}
