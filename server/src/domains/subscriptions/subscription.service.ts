import { Types } from 'mongoose';
import { Subscription } from './subscription.model';
import { Employee } from '../employees/employee.model';
import type { ISubscription, CreateSubscriptionDto } from '@payslips-maker/shared';

const PLAN_AMOUNTS: Record<string, number> = {
  per_employee: 40,
  full:         85,
};

export const SubscriptionService = {
  async getActiveByUserId(userId: string): Promise<ISubscription[]> {
    const now = new Date();

    // Flip any subscriptions that expired without being explicitly cancelled
    await Subscription.updateMany(
      { userId: new Types.ObjectId(userId), status: 'active', expiresAt: { $lte: now } },
      { $set: { status: 'expired' } }
    );

    const docs = await Subscription.find({
      userId:    new Types.ObjectId(userId),
      status:    'active',
      expiresAt: { $gt: now },
    }).lean();

    return docs.map((d) => ({
      ...d,
      _id:        d._id.toString(),
      userId:     d.userId.toString(),
      employeeId: d.employeeId?.toString(),
    })) as ISubscription[];
  },

  async createSubscription(userId: string, dto: CreateSubscriptionDto): Promise<ISubscription> {
    const now    = new Date();
    const expiry = new Date(now);
    expiry.setMonth(expiry.getMonth() + 1);

    const doc = await Subscription.create({
      userId:     new Types.ObjectId(userId),
      employeeId: dto.employeeId ? new Types.ObjectId(dto.employeeId) : undefined,
      plan:       dto.plan,
      status:     'active',
      amountILS:  PLAN_AMOUNTS[dto.plan],
      startedAt:  now,
      expiresAt:  expiry,
    });

    return {
      ...doc.toObject(),
      _id:        doc._id.toString(),
      userId,
      employeeId: dto.employeeId,
    } as unknown as ISubscription;
  },

  async cancelSubscription(subscriptionId: string, userId: string): Promise<boolean> {
    const result = await Subscription.updateOne(
      { _id: subscriptionId, userId: new Types.ObjectId(userId) },
      { $set: { status: 'cancelled' } }
    );
    return result.modifiedCount === 1;
  },

  async incrementGenerateCount(employeeId: string, userId: string): Promise<number> {
    const doc = await Employee.findOneAndUpdate(
      { _id: new Types.ObjectId(employeeId), userId: new Types.ObjectId(userId) },
      { $inc: { pdfGenerateCount: 1 } },
      { new: true }
    );
    return doc?.pdfGenerateCount ?? 0;
  },

  async getEmployeeGenerateCount(employeeId: string, userId: string): Promise<number> {
    const doc = await Employee.findOne({
      _id:    new Types.ObjectId(employeeId),
      userId: new Types.ObjectId(userId),
    }).lean();
    return doc?.pdfGenerateCount ?? 0;
  },
};
