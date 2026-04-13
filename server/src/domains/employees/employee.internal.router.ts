import { Router, Request, Response } from 'express';
import { EmployeeService } from './employee.service';
import { routeHandler } from '../../middleware/routeHandler';

const router = Router();

// GET /api/internal/employees?companyId=X
router.get('/', routeHandler(async (req: Request, res: Response): Promise<void> => {
  const { companyId } = req.query as { companyId?: string };
  if (!companyId) {
    res.status(400).json({ success: false, error: 'companyId query param required' });
    return;
  }
  const employees = await EmployeeService.getEmployeesByCompanyId(companyId);
  res.json(employees);
}));

export { router as employeeInternalRouter };
