import { Types } from 'mongoose';
import { Form } from './form.model';
import type {
  CreateFormDto,
  UpdateFormDto,
  FormListItem,
  IForm,
  AdminFormsQuery,
  FormType,
} from '@payslips-maker/shared';

export const FormService = {
  async createForm(
    clerkId: string,
    userId: string,
    producedByName: string,
    dto: CreateFormDto,
    companyIds: string[],
    hasSubscription = false
  ): Promise<IForm> {
    if (!hasSubscription) {
      const count = await Form.countDocuments({
        companyId: { $in: companyIds.map((id) => new Types.ObjectId(id)) },
      });
      if (count >= 10) throw new Error('FORM_LIMIT_REACHED');
    }
    const { employeeId, companyId, ...restDto } = dto;
    const form = await Form.create({
      clerkId,
      userId: new Types.ObjectId(userId),
      producedByName,
      companyId: new Types.ObjectId(companyId),
      employeeId: new Types.ObjectId(employeeId),
      ...restDto,
    });
    return {
      ...form.toObject(),
      _id: form._id.toString(),
      userId: userId,
      companyId: companyId,
      employeeId: employeeId,
    } as unknown as IForm;
  },

  async updateForm(
    formId: string,
    companyIds: string[],
    dto: UpdateFormDto
  ): Promise<IForm | null> {
    const form = await Form.findOneAndUpdate(
      {
        _id: formId,
        companyId: { $in: companyIds.map((id) => new Types.ObjectId(id)) },
      },
      { $set: dto },
      { new: true }
    );
    return form ? (form.toObject() as unknown as IForm) : null;
  },

  async getCompanyForms(
    companyIds: string[],
    filters?: { companyId?: string; employeeId?: string; formType?: FormType }
  ): Promise<FormListItem[]> {
    const query: Record<string, unknown> = {
      companyId: { $in: companyIds.map((id) => new Types.ObjectId(id)) },
    };
    if (filters?.companyId) query.companyId = new Types.ObjectId(filters.companyId);
    if (filters?.employeeId) query.employeeId = new Types.ObjectId(filters.employeeId);
    if (filters?.formType) query.formType = filters.formType;

    const forms = await Form.find(query)
      .sort({ 'period.year': -1, 'period.month': -1, updatedAt: -1 })
      .select('formType companyId employeeId period employeeInfo.fullName payCalculation.grossSalary netSalary producedByName updatedAt')
      .lean();

    return forms.map((f) => ({
      _id: f._id.toString(),
      formType: f.formType,
      companyId: f.companyId.toString(),
      employeeId: f.employeeId.toString(),
      period: f.period,
      employeeName: f.employeeInfo.fullName,
      grossSalary: f.payCalculation.grossSalary,
      netSalary: f.netSalary,
      producedByName: f.producedByName,
      updatedAt: f.updatedAt,
    }));
  },

  async deleteForm(formId: string, companyIds: string[]): Promise<boolean> {
    const result = await Form.deleteOne({
      _id: formId,
      companyId: { $in: companyIds.map((id) => new Types.ObjectId(id)) },
    });
    return result.deletedCount === 1;
  },

  async getFormById(formId: string, companyIds: string[]): Promise<IForm | null> {
    const form = await Form.findOne({
      _id: formId,
      companyId: { $in: companyIds.map((id) => new Types.ObjectId(id)) },
    }).lean();
    if (!form) return null;
    return {
      ...form,
      _id: form._id.toString(),
      companyId: form.companyId.toString(),
      userId: form.userId.toString(),
      employeeId: form.employeeId.toString(),
    } as unknown as IForm;
  },

  async getAllForms(query: AdminFormsQuery) {
    const filter: Record<string, unknown> = {};

    if (query.userId) filter['userId'] = new Types.ObjectId(query.userId);
    if (query.month) filter['period.month'] = query.month;
    if (query.year) filter['period.year'] = query.year;

    const sortField =
      query.sortBy === 'employeeName'
        ? 'employeeInfo.fullName.he'
        : query.sortBy === 'grossSalary'
        ? 'payCalculation.grossSalary'
        : query.sortBy ?? 'updatedAt';

    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [forms, total] = await Promise.all([
      Form.find(filter)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'fullName email')
        .lean(),
      Form.countDocuments(filter),
    ]);

    return { forms, total, page, limit };
  },

  async getFormsByCompanyId(companyId: string): Promise<FormListItem[]> {
    return FormService.getCompanyForms([companyId], { companyId });
  },

  async getFormsByCompanyAndEmployee(companyId: string, employeeId: string): Promise<FormListItem[]> {
    return FormService.getCompanyForms([companyId], { companyId, employeeId });
  },

  async getFormCountsByUserIds(userIds: string[]): Promise<{ userId: string; count: number }[]> {
    const results = await Form.aggregate([
      { $match: { userId: { $in: userIds.map((id) => new Types.ObjectId(id)) } } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
    ]);
    return results.map((r) => ({ userId: r._id.toString(), count: r.count }));
  },

  async getFormsByUserId(userId: string) {
    return Form.find({ userId: new Types.ObjectId(userId) })
      .sort({ updatedAt: -1 })
      .lean();
  },
};
