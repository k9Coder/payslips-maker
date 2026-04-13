import { Router, Request, Response } from 'express';
import { UserService } from './user.service';
import { routeHandler } from '../../middleware/routeHandler';

const router = Router();

// GET /api/internal/users/:id
router.get('/:id', routeHandler(async (req: Request, res: Response): Promise<void> => {
  const user = await UserService.getUserById(req.params.id);
  if (!user) {
    res.status(404).json({ success: false, error: 'User not found' });
    return;
  }
  res.json(user);
}));

// POST /api/internal/users/:id/companies  — link a company to the user
router.post('/:id/companies', routeHandler(async (req: Request, res: Response): Promise<void> => {
  const { companyId } = req.body as { companyId: string };
  await UserService.addCompanyToUser(req.params.id, companyId);
  res.status(204).end();
}));

// DELETE /api/internal/users/:id/companies/:companyId  — unlink a company from the user
router.delete('/:id/companies/:companyId', routeHandler(async (req: Request, res: Response): Promise<void> => {
  const removed = await UserService.removeCompanyFromUser(req.params.id, req.params.companyId);
  if (!removed) {
    res.status(404).json({ success: false, error: 'Company not found on user' });
    return;
  }
  res.status(204).end();
}));

export { router as userInternalRouter };
