import { Router, Request, Response } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { FormService } from './form.service';
import { createFormSchema, updateFormSchema } from './form.schema';
import { logger } from '../../infrastructure/logger/logger';

const router = Router();

// GET /api/forms
router.get('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const forms = await FormService.getUserForms(req.userId!);
    res.json({ success: true, data: forms });
  } catch (error) {
    logger.error('GET /forms failed', { error: String(error) });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /api/forms
router.post('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const parsed = createFormSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: parsed.error.flatten().fieldErrors });
    return;
  }

  try {
    const form = await FormService.createForm(req.clerkId!, req.userId!, parsed.data);
    res.status(201).json({ success: true, data: form });
  } catch (error) {
    if (error instanceof Error && error.message === 'FORM_LIMIT_REACHED') {
      res.status(422).json({ success: false, error: 'FORM_LIMIT_REACHED' });
      return;
    }
    logger.error('POST /forms failed', { error: String(error) });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /api/forms/:id
router.get('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const form = await FormService.getFormById(req.params.id, req.userId!);
    if (!form) {
      res.status(404).json({ success: false, error: 'Form not found' });
      return;
    }
    res.json({ success: true, data: form });
  } catch (error) {
    logger.error('GET /forms/:id failed', { error: String(error) });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// PUT /api/forms/:id
router.put('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const parsed = updateFormSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: parsed.error.flatten().fieldErrors });
    return;
  }

  try {
    const form = await FormService.updateForm(req.params.id, req.userId!, parsed.data);
    if (!form) {
      res.status(404).json({ success: false, error: 'Form not found' });
      return;
    }
    res.json({ success: true, data: form });
  } catch (error) {
    logger.error('PUT /forms/:id failed', { error: String(error) });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export { router as formRouter };
