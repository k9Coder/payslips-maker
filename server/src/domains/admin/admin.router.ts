import { Router, Request, Response } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { adminMiddleware } from '../../middleware/admin.middleware';
import { UserService } from '../users/user.service';
import { FormService } from '../forms/form.service';
import { routeHandler } from '../../middleware/routeHandler';
import type { AdminFormsQuery } from '@payslips-maker/shared';

const router = Router();

// All admin routes require auth + admin role
router.use(authMiddleware, adminMiddleware);

// GET /api/admin/users
router.get('/users', routeHandler(async (req: Request, res: Response): Promise<void> => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const { users, total } = await UserService.getAllUsers(page, limit);
  res.json({ success: true, data: users, total, page, limit });
}));

// GET /api/admin/users/:id
router.get('/users/:id', routeHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await UserService.getUserWithForms(req.params.id);
  if (!result) {
    res.status(404).json({ success: false, error: 'User not found' });
    return;
  }
  res.json({ success: true, data: result });
}));

// GET /api/admin/forms
router.get('/forms', routeHandler(async (req: Request, res: Response): Promise<void> => {
  const query: AdminFormsQuery = {
    userId: req.query.userId as string | undefined,
    month: req.query.month ? Number(req.query.month) : undefined,
    year: req.query.year ? Number(req.query.year) : undefined,
    sortBy: req.query.sortBy as AdminFormsQuery['sortBy'],
    sortOrder: req.query.sortOrder as AdminFormsQuery['sortOrder'],
    page: req.query.page ? Number(req.query.page) : undefined,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
  };
  const result = await FormService.getAllForms(query);
  res.json({ success: true, ...result });
}));

export { router as adminRouter };
