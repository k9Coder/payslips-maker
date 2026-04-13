import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@clerk/backend';
import { User } from '../domains/users/user.model';
import { env } from '../infrastructure/env';
import { logger } from '../infrastructure/logger/logger';

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Missing authorization token' });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const verified = await verifyToken(token, {
      secretKey: env.CLERK_SECRET_KEY,
      authorizedParties: ['http://localhost:5173'],
    });
    const clerkId = verified.sub;

    const user = await User.findOne({ clerkId });

    if (!user) {
      // User authenticated with Clerk but not yet synced to DB
      // Return 202 so client can call /api/users/sync and retry
      res.status(202).json({ success: false, error: 'USER_SYNC_REQUIRED' });
      return;
    }

    req.clerkId = clerkId;
    req.userId = user._id.toString();
    req.isAdmin = user.isAdmin;
    req.hasSubscription = user.hasSubscription;
    req.companyIds = user.companyIds.map((id) => id.toString());

    const impersonateId = req.headers['x-impersonate-user'] as string | undefined;
    if (impersonateId && user.isAdmin) {
      const target = await User.findById(impersonateId);
      if (!target) {
        res.status(404).json({ success: false, error: 'Impersonation target not found' });
        return;
      }
      req.userId = target._id.toString();
      req.companyIds = target.companyIds.map((id) => id.toString());
      req.hasSubscription = target.hasSubscription;
      req.impersonating = true;
      req.impersonatedUserId = target._id.toString();
    }

    next();
  } catch (error) {
    logger.warn('Auth token verification failed', { error: String(error) });
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
}
