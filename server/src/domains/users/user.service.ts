import { User } from './user.model';
import type { UpdateUserDto, AdminUserView, IUser } from '@payslips-maker/shared';
import { logger } from '../../infrastructure/logger/logger';
import { internalClient } from '../../infrastructure/internalClient';

export const UserService = {
  async createUserFromClerk(
    clerkId: string,
    email: string,
    fullName: string
  ): Promise<IUser> {
    const existing = await User.findOne({ clerkId });
    if (existing) return existing.toObject() as unknown as IUser;

    const user = await User.create({ clerkId, email, fullName });
    logger.info('User created from Clerk webhook', { clerkId, email });
    return user.toObject() as unknown as IUser;
  },

  async syncUser(
    clerkId: string,
    email: string,
    fullName: string
  ): Promise<IUser> {
    const user = await User.findOneAndUpdate(
      { clerkId },
      { $setOnInsert: { clerkId, email, fullName, isAdmin: false } },
      { upsert: true, new: true }
    );
    return user.toObject() as unknown as IUser;
  },

  async getUserByClerkId(clerkId: string): Promise<IUser | null> {
    const user = await User.findOne({ clerkId }).lean();
    if (!user) return null;
    return {
      ...user,
      _id: user._id.toString(),
    } as unknown as IUser;
  },

  async updateUser(clerkId: string, dto: UpdateUserDto): Promise<IUser | null> {
    const user = await User.findOneAndUpdate(
      { clerkId },
      { $set: dto },
      { new: true }
    );
    return user ? (user.toObject() as unknown as IUser) : null;
  },

  async getAllUsers(page = 1, limit = 20): Promise<{ users: AdminUserView[]; total: number }> {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(),
    ]);

    const userIds = users.map((u) => u._id.toString());
    const { data: formCounts } = await internalClient.get<{ userId: string; count: number }[]>(
      '/api/internal/forms/counts',
      { params: { userIds } }
    );

    const countMap = new Map(formCounts.map((fc) => [fc.userId, fc.count]));

    const adminUsers: AdminUserView[] = users.map((u) => ({
      ...(u as unknown as IUser),
      _id: u._id.toString(),
      formCount: countMap.get(u._id.toString()) ?? 0,
    }));

    return { users: adminUsers, total };
  },

  async setSubscription(userId: string, hasSubscription: boolean): Promise<IUser | null> {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { hasSubscription } },
      { new: true }
    );
    return user ? (user.toObject() as unknown as IUser) : null;
  },

  async getUserWithForms(userId: string) {
    const user = await User.findById(userId).lean();
    if (!user) return null;

    const { data: forms } = await internalClient.get('/api/internal/forms', { params: { userId } });

    return {
      user: {
        ...user,
        _id: user._id.toString(),
      } as unknown as IUser,
      forms,
    };
  },

  async getUserById(userId: string): Promise<IUser | null> {
    const user = await User.findById(userId).lean();
    if (!user) return null;
    return {
      ...user,
      _id: user._id.toString(),
    } as unknown as IUser;
  },
};
