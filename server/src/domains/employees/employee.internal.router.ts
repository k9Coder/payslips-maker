import { Router, Request, Response } from 'express';
import { Employee } from './employee.model';
import { routeHandler } from '../../middleware/routeHandler';

const router = Router();

// GET /api/internal/employees/:id
router.get('/:id', routeHandler(async (req: Request, res: Response): Promise<void> => {
  const employee = await Employee.findById(req.params.id).lean();
  if (!employee) {
    res.status(404).json({ success: false, error: 'Employee not found' });
    return;
  }
  res.json(employee);
}));

export { router as employeeInternalRouter };
