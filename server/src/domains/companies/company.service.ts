import { Types } from 'mongoose';
import { Company } from './company.model';
import { internalClient } from '../../infrastructure/internalClient';
import type { ICompany, CreateCompanyDto, UpdateCompanyDto, IUser } from '@payslips-maker/shared';

export const CompanyService = {
  async createCompany(
    userId: string,
    dto: CreateCompanyDto,
    hasSubscription: boolean
  ): Promise<ICompany> {
    const { data: user } = await internalClient.get<IUser>(`/api/internal/users/${userId}`);
    if (!user) throw new Error('User not found');

    if (!hasSubscription && user.companyIds.length >= 1) {
      throw new Error('COMPANY_LIMIT_REACHED');
    }

    const company = await Company.create(dto);
    await internalClient.post(`/api/internal/users/${userId}/companies`, {
      companyId: company._id.toString(),
    });

    return { ...company.toObject(), _id: company._id.toString() } as ICompany;
  },

  async getCompaniesByIds(companyIds: string[]): Promise<ICompany[]> {
    const companies = await Company.find({
      _id: { $in: companyIds.map((id) => new Types.ObjectId(id)) },
    })
      .sort({ createdAt: -1 })
      .lean();

    return companies.map((c) => ({
      ...c,
      _id: c._id.toString(),
    })) as ICompany[];
  },

  async getCompanyById(companyId: string, companyIds: string[]): Promise<ICompany | null> {
    if (!companyIds.includes(companyId)) return null; // This is an authorization guard — it ensures a user can only access companies they own. companyIds is the list of company IDs belonging to the authenticated user (pulled from user.companyIds in MongoDB).
    const company = await Company.findById(companyId).lean();
    if (!company) return null;
    return { ...company, _id: company._id.toString() } as ICompany;
  },

  async updateCompany(
    companyId: string,
    companyIds: string[],
    dto: UpdateCompanyDto
  ): Promise<ICompany | null> {
    if (!companyIds.includes(companyId)) return null;
    const company = await Company.findByIdAndUpdate(
      companyId,
      { $set: dto },
      { new: true }
    ).lean();
    if (!company) return null;
    return { ...company, _id: company._id.toString() } as ICompany;
  },

  async removeCompanyFromUser(companyId: string, userId: string): Promise<boolean> {
    const { status } = await internalClient.delete(
      `/api/internal/users/${userId}/companies/${companyId}`
    );
    return status === 204;
  },

  // Admin: get all companies
  async getAllCompanies(): Promise<ICompany[]> {
    const companies = await Company.find().sort({ createdAt: -1 }).lean();
    return companies.map((c) => ({ ...c, _id: c._id.toString() })) as ICompany[];
  },

  // Admin: get companies for a specific user
  async getCompaniesByUserId(userId: string): Promise<ICompany[]> {
    const { data: user } = await internalClient.get<IUser>(`/api/internal/users/${userId}`);
    if (!user) return [];
    return CompanyService.getCompaniesByIds(user.companyIds);
  },

  async getEmployeesByCompanyId(companyId: string): Promise<unknown[]> {
    const { data: employees } = await internalClient.get<unknown[]>('/api/internal/employees', {
      params: { companyId },
    });
    return employees;
  },
};
