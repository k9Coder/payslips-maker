import { Router, Request, Response } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { UserService } from './user.service';
import { updateUserSchema } from './user.schema';
import { createClerkClient, verifyToken } from '@clerk/backend';
import { env } from '../../infrastructure/env';
import { logger } from '../../infrastructure/logger/logger';
import { routeHandler } from '../../middleware/routeHandler';

const clerkClient = createClerkClient({ secretKey: env.CLERK_SECRET_KEY });

const router = Router();

// GET /api/users/me
router.get('/me', authMiddleware, routeHandler(async (req: Request, res: Response): Promise<void> => {
  const user = await UserService.getUserByClerkId(req.clerkId!);
  if (!user) {
    res.status(404).json({ success: false, error: 'User not found' });
    return;
  }
  res.json({ success: true, data: user });
}));

// PUT /api/users/me
router.put('/me', authMiddleware, routeHandler(async (req: Request, res: Response): Promise<void> => {
  const parsed = updateUserSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: parsed.error.flatten().fieldErrors });
    return;
  }

  const user = await UserService.updateUser(req.clerkId!, parsed.data);
  if (!user) {
    res.status(404).json({ success: false, error: 'User not found' });
    return;
  }
  res.json({ success: true, data: user });
}));

// POST /api/users/sync - find-or-create user (safety net for webhook race condition)
router.post('/sync', routeHandler(async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Missing token' });
    return;
  }

  const token = authHeader.slice(7);

  const verified = await verifyToken(token, {
    secretKey: env.CLERK_SECRET_KEY,
    authorizedParties: ['http://localhost:5173'],
  });
  const clerkId = verified.sub;

  const clerkUser = await clerkClient.users.getUser(clerkId);
  const email = clerkUser.emailAddresses[0]?.emailAddress ?? '';
  const fullName = `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim();

  const user = await UserService.syncUser(clerkId, email, fullName);
  res.json({ success: true, data: user });
}));

export { router as userRouter };
