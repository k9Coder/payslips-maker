import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { routeHandler } from '../../middleware/routeHandler';
import { getMonthSummary, createEntry, updateEntry, deleteEntry } from './worklog.service';
import { createWorkLogEntrySchema, updateWorkLogEntrySchema, workLogMonthQuerySchema } from './worklog.schema';

const router = Router();
router.use(authMiddleware);

// GET /api/worklog?employeeId=&year=&month=
router.get('/', routeHandler(async (req, res) => {
  const { employeeId, year, month } = workLogMonthQuerySchema.parse(req.query);
  const summary = await getMonthSummary(req.userId!, employeeId, year, month);
  res.json({ data: summary });
}));

// POST /api/worklog — create a new entry (multiple allowed per day)
router.post('/', routeHandler(async (req, res) => {
  const body = createWorkLogEntrySchema.parse(req.body);
  const entry = await createEntry(req.userId!, body);
  res.status(201).json({ data: entry });
}));

// PATCH /api/worklog/:id — update an existing entry
router.patch('/:id', routeHandler(async (req, res) => {
  const body = updateWorkLogEntrySchema.parse(req.body);
  const entry = await updateEntry(req.userId!, req.params.id, body);
  if (!entry) { res.status(404).json({ error: 'Not found' }); return; }
  res.json({ data: entry });
}));

// DELETE /api/worklog/:id
router.delete('/:id', routeHandler(async (req, res) => {
  await deleteEntry(req.userId!, req.params.id);
  res.status(204).send();
}));

export default router;
