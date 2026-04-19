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

export { router as userInternalRouter };
