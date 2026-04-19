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
    hasSubscription = false
  ): Promise<IForm> {
    if (!hasSubscription) {
      const count = await Form.countDocuments({
        userId: new Types.ObjectId(userId),
      });
      if (count >= 10) throw new Error('FORM_LIMIT_REACHED');
    }
    const { employeeId, ...restDto } = dto;
    const form = await Form.create({
      clerkId,
      userId: new Types.ObjectId(userId),
      producedByName,
      employeeId: new Types.ObjectId(employeeId),
      ...restDto,
    });
    return {
      ...form.toObject(),
      _id: form._id.toString(),
      userId: userId,
      employeeId: employeeId,
    } as unknown as IForm;
  },

  async updateForm(
    formId: string,
    userId: string,
    dto: UpdateFormDto
  ): Promise<IForm | null> {
    const form = await Form.findOneAndUpdate(
      {
        _id: formId,
        userId: new Types.ObjectId(userId),
      },
      { $set: dto },
      { new: true }
    );
    return form ? (form.toObject() as unknown as IForm) : null;
  },

  async getUserForms(
    userId: string,
    filters?: { employeeId?: string; formType?: FormType; month?: number; year?: number }
  ): Promise<FormListItem[]> {
    const query: Record<string, unknown> = {
      userId: new Types.ObjectId(userId),
    };
    if (filters?.employeeId) query.employeeId = new Types.ObjectId(filters.employeeId);
    if (filters?.formType) query.formType = filters.formType;
    if (filters?.month) query['period.month'] = filters.month;
    if (filters?.year) query['period.year'] = filters.year;

    const forms = await Form.find(query)
      .sort({ 'period.year': -1, 'period.month': -1, updatedAt: -1 })
      .select('formType employeeId period employeeInfo.fullName payCalculation.grossSalary netSalary producedByName updatedAt')
      .lean();

    return forms.map((f) => ({
      _id: f._id.toString(),
      formType: f.formType,
      employeeId: f.employeeId.toString(),
      period: f.period,
      employeeName: f.employeeInfo.fullName,
      grossSalary: f.payCalculation.grossSalary,
      netSalary: f.netSalary,
      producedByName: f.producedByName,
      updatedAt: f.updatedAt,
    }));
  },

  async deleteForm(formId: string, userId: string): Promise<boolean> {
    const result = await Form.deleteOne({
      _id: formId,
      userId: new Types.ObjectId(userId),
    });
    return result.deletedCount === 1;
  },

  async getFormById(formId: string, userId: string): Promise<IForm | null> {
    const form = await Form.findOne({
      _id: formId,
      userId: new Types.ObjectId(userId),
    }).lean();
    if (!form) return null;
    return {
      ...form,
      _id: form._id.toString(),
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
