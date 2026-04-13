import { Types } from 'mongoose';
import { Employee } from './employee.model';
import type { IEmployee, CreateEmployeeDto, UpdateEmployeeDto } from '@payslips-maker/shared';

export const EmployeeService = {
  // companyIds = all companies the current user manages (for auth + limit checks)
  async createEmployee(
    companyId: string,
    companyIds: string[],
    dto: CreateEmployeeDto,
    hasSubscription: boolean
  ): Promise<IEmployee> {
    if (!hasSubscription) {
      const count = await Employee.countDocuments({
        companyId: { $in: companyIds.map((id) => new Types.ObjectId(id)) },
      });
      if (count >= 1) throw new Error('EMPLOYEE_LIMIT_REACHED');
    }
    const emp = await Employee.create({ companyId: new Types.ObjectId(companyId), ...dto });
    return { ...emp.toObject(), _id: emp._id.toString(), companyId } as IEmployee;
  },

  async getEmployeesByCompanyIds(companyIds: string[]): Promise<IEmployee[]> {
    const employees = await Employee.find({
      companyId: { $in: companyIds.map((id) => new Types.ObjectId(id)) },
    })
      .sort({ createdAt: -1 })
      .lean();
    return employees.map((e) => ({
      ...e,
      _id: e._id.toString(),
      companyId: e.companyId.toString(),
    })) as IEmployee[];
  },

  async getEmployeesByCompanyId(companyId: string): Promise<IEmployee[]> {
    const employees = await Employee.find({ companyId: new Types.ObjectId(companyId) })
      .sort({ createdAt: -1 })
      .lean();
    return employees.map((e) => ({
      ...e,
      _id: e._id.toString(),
      companyId,
    })) as IEmployee[];
  },

  async getEmployeeById(employeeId: string, companyIds: string[]): Promise<IEmployee | null> {
    const emp = await Employee.findOne({
      _id: employeeId,
      companyId: { $in: companyIds.map((id) => new Types.ObjectId(id)) },
    }).lean();
    if (!emp) return null;
    return { ...emp, _id: emp._id.toString(), companyId: emp.companyId.toString() } as IEmployee;
  },

  async updateEmployee(
    employeeId: string,
    companyIds: string[],
    dto: UpdateEmployeeDto
  ): Promise<IEmployee | null> {
    const emp = await Employee.findOneAndUpdate(
      {
        _id: employeeId,
        companyId: { $in: companyIds.map((id) => new Types.ObjectId(id)) },
      },
      { $set: dto },
      { new: true }
    ).lean();
    if (!emp) return null;
    return { ...emp, _id: emp._id.toString(), companyId: emp.companyId.toString() } as IEmployee;
  },

  async deleteEmployee(employeeId: string, companyIds: string[]): Promise<boolean> {
    const result = await Employee.deleteOne({
      _id: employeeId,
      companyId: { $in: companyIds.map((id) => new Types.ObjectId(id)) },
    });
    return result.deletedCount === 1;
  },
};
