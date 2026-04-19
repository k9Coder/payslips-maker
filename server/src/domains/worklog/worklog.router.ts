import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { routeHandler } from '../../middleware/routeHandler';
import { getMonthSummary, upsertEntry, deleteEntry } from './worklog.service';
import { createWorkLogEntrySchema, workLogMonthQuerySchema } from './worklog.schema';

const router = Router();
router.use(authMiddleware);

// GET /api/worklog?employeeId=&year=&month=
router.get('/', routeHandler(async (req, res) => {
  const { employeeId, year, month } = workLogMonthQuerySchema.parse(req.query);
  const summary = await getMonthSummary(req.userId!, employeeId, year, month);
  res.json({ data: summary });
}));

// POST /api/worklog — upsert (one entry per employee per date)
router.post('/', routeHandler(async (req, res) => {
  const body = createWorkLogEntrySchema.parse(req.body);
  const entry = await upsertEntry(req.userId!, body);
  res.status(200).json({ data: entry });
}));

// DELETE /api/worklog/:id
router.delete('/:id', routeHandler(async (req, res) => {
  await deleteEntry(req.userId!, req.params.id);
  res.status(204).send();
}));

export default router;
