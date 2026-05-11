import { User } from './user.model';
import type { UpdateUserDto, AdminUserView, IUser } from '@payslips-maker/shared';
import { logger } from '../../infrastructure/logger/logger';
import { internalClient } from '../../infrastructure/internalClient';

export const UserService = {
  async createUserFromClerk(
    clerkId: string,
    email: string,
    fullName: string,
    isAdmin: boolean = false
  ): Promise<IUser> {
    logger.info('createUserFromClerk called', { clerkId, email, fullName, isAdmin });
    
    // Check if user exists by clerkId first
    let user = await User.findOne({ clerkId });
    if (user) {
      logger.info('User already exists by clerkId', { clerkId });
      return user.toObject() as unknown as IUser;
    }

    // Try to upsert by clerkId (will use email from setOnInsert if new)
    try {
      user = await User.findOneAndUpdate(
        { clerkId },
        { $setOnInsert: { clerkId, email, fullName, isAdmin } },
        { upsert: true, new: true }
      );
      if(!user){
        throw new Error('failed to create user, idk why.');
      }
      logger.info('User created from Clerk webhook', { clerkId, mongoId: user._id, email });
      return user.toObject() as unknown as IUser;
    } catch (error) {
      // If E11000 error on email, try to update existing user by email
      if (error instanceof Error && error.message.includes('E11000') && error.message.includes('email')) {
        logger.warn('Email conflict, updating existing user', { email, clerkId });
        user = await User.findOneAndUpdate(
          { email },
          { clerkId, fullName },
          { new: true }
        );
        if (user) {
          logger.info('User updated with new clerkId', { email, clerkId, mongoId: user._id });
          return user.toObject() as unknown as IUser;
        }
      }
      throw error;
    }
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
