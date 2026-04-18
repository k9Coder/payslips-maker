import mongoose from 'mongoose';
import { Employee } from './employee.model';

export async function getEmployeesByUser(userId: string) {
  return Employee.find({ userId: new mongoose.Types.ObjectId(userId) }).lean();
}

export async function getEmployeeById(id: string, userId: string) {
  return Employee.findOne({
    _id: new mongoose.Types.ObjectId(id),
    userId: new mongoose.Types.ObjectId(userId),
  }).lean();
}

export async function createEmployee(userId: string, data: Record<string, unknown>) {
  const employee = new Employee({ ...data, userId: new mongoose.Types.ObjectId(userId) });
  return employee.save();
}

export async function updateEmployee(id: string, userId: string, data: Record<string, unknown>) {
  return Employee.findOneAndUpdate(
    { _id: id, userId: new mongoose.Types.ObjectId(userId) },
    data,
    { new: true }
  ).lean();
}

export async function deleteEmployee(id: string, userId: string) {
  return Employee.findOneAndDelete({
    _id: id,
    userId: new mongoose.Types.ObjectId(userId),
  });
}

export async function countEmployeesByUser(userId: string) {
  return Employee.countDocuments({ userId: new mongoose.Types.ObjectId(userId) });
}
