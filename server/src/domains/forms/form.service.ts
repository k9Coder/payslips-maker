import { Types } from 'mongoose';
import { Form } from './form.model';
import type {
  CreateFormDto,
  UpdateFormDto,
  FormListItem,
  IForm,
  AdminFormsQuery,
} from '@payslips-maker/shared';

export const FormService = {
  async createForm(
    clerkId: string,
    userId: string,
    dto: CreateFormDto
  ): Promise<IForm> {
    const count = await Form.countDocuments({ userId: new Types.ObjectId(userId) });
    if (count >= 10) {
      throw new Error('FORM_LIMIT_REACHED');
    }
    const form = await Form.create({
      clerkId,
      userId: new Types.ObjectId(userId),
      ...dto,
    });
    return form.toObject() as unknown as IForm;
  },

  async updateForm(
    formId: string,
    userId: string,
    dto: UpdateFormDto
  ): Promise<IForm | null> {
    const form = await Form.findOneAndUpdate(
      { _id: formId, userId: new Types.ObjectId(userId) },
      { $set: dto },
      { new: true }
    );
    return form ? (form.toObject() as unknown as IForm) : null;
  },

  async getUserForms(userId: string): Promise<FormListItem[]> {
    const forms = await Form.find({ userId: new Types.ObjectId(userId) })
      .sort({ updatedAt: -1 })
      .select('period employeeInfo.fullName payCalculation.grossSalary netSalary updatedAt')
      .lean();

    return forms.map((f) => ({
      _id: f._id.toString(),
      period: f.period,
      employeeName: f.employeeInfo.fullName,
      grossSalary: f.payCalculation.grossSalary,
      netSalary: f.netSalary,
      updatedAt: f.updatedAt,
    }));
  },

  async getFormById(formId: string, userId: string): Promise<IForm | null> {
    const form = await Form.findOne({
      _id: formId,
      userId: new Types.ObjectId(userId),
    }).lean();
    if (!form) return null;
    return { ...form, _id: form._id.toString(), userId: form.userId.toString() } as unknown as IForm;
  },

  async getAllForms(query: AdminFormsQuery) {
    const filter: Record<string, unknown> = {};

    if (query.userId) filter['userId'] = new Types.ObjectId(query.userId);
    if (query.month) filter['period.month'] = query.month;
    if (query.year) filter['period.year'] = query.year;

    const sortField = query.sortBy === 'employeeName'
      ? 'employeeInfo.fullName'
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

  async getFormsByUserId(userId: string): Promise<FormListItem[]> {
    return FormService.getUserForms(userId);
  },
};
