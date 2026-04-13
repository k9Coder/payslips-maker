import { Router, Request, Response } from 'express';
import { FormService } from './form.service';
import { routeHandler } from '../../middleware/routeHandler';

const router = Router();

// GET /api/internal/forms/counts?userIds[]=X&userIds[]=Y
router.get('/counts', routeHandler(async (req: Request, res: Response): Promise<void> => {
  const userIds = ([] as string[]).concat((req.query.userIds as string | string[]) ?? []);
  const counts = await FormService.getFormCountsByUserIds(userIds);
  res.json(counts);
}));

// GET /api/internal/forms?userId=X
router.get('/', routeHandler(async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.query as { userId?: string };
  if (!userId) {
    res.status(400).json({ success: false, error: 'userId query param required' });
    return;
  }
  const forms = await FormService.getFormsByUserId(userId);
  res.json(forms);
}));

export { router as formInternalRouter };
