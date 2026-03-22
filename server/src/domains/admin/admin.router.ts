import { Router, Request, Response } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { adminMiddleware } from '../../middleware/admin.middleware';
import { UserService } from '../users/user.service';
import { FormService } from '../forms/form.service';
import { logger } from '../../infrastructure/logger/logger';
import type { AdminFormsQuery } from '@payslips-maker/shared';

const router = Router();

// All admin routes require auth + admin role
router.use(authMiddleware, adminMiddleware);

// GET /api/admin/users
router.get('/users', async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const { users, total } = await UserService.getAllUsers(page, limit);
    res.json({ success: true, data: users, total, page, limit });
  } catch (error) {
    logger.error('GET /admin/users failed', { error: String(error) });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /api/admin/users/:id
router.get('/users/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await UserService.getUserWithForms(req.params.id);
    if (!result) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('GET /admin/users/:id failed', { error: String(error) });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /api/admin/users/:id/forms
router.get('/users/:id/forms', async (req: Request, res: Response): Promise<void> => {
  try {
    const forms = await FormService.getFormsByUserId(req.params.id);
    res.json({ success: true, data: forms });
  } catch (error) {
    logger.error('GET /admin/users/:id/forms failed', { error: String(error) });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /api/admin/forms
router.get('/forms', async (req: Request, res: Response): Promise<void> => {
  try {
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
  } catch (error) {
    logger.error('GET /admin/forms failed', { error: String(error) });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export { router as adminRouter };
