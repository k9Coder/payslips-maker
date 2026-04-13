import { Router, Request, Response } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { EmployeeService } from './employee.service';
import { updateEmployeeSchema } from './employee.schema';
import { routeHandler } from '../../middleware/routeHandler';

const router = Router();

// GET /api/employees?companyId=
router.get('/', authMiddleware, routeHandler(async (req: Request, res: Response): Promise<void> => {
  const companyId = req.query.companyId as string | undefined;
  let employees;
  if (companyId) {
    if (!(req.companyIds ?? []).includes(companyId)) {
      res.status(404).json({ success: false, error: 'Company not found' });
      return;
    }
    employees = await EmployeeService.getEmployeesByCompanyId(companyId);
  } else {
    employees = await EmployeeService.getEmployeesByCompanyIds(req.companyIds ?? []);
  }
  res.json({ success: true, data: employees });
}));

// GET /api/employees/:id
router.get('/:id', authMiddleware, routeHandler(async (req: Request, res: Response): Promise<void> => {
  const employee = await EmployeeService.getEmployeeById(req.params.id, req.companyIds ?? []);
  if (!employee) {
    res.status(404).json({ success: false, error: 'Employee not found' });
    return;
  }
  res.json({ success: true, data: employee });
}));

// PATCH /api/employees/:id
router.patch('/:id', authMiddleware, routeHandler(async (req: Request, res: Response): Promise<void> => {
  const parsed = updateEmployeeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: parsed.error.flatten().fieldErrors });
    return;
  }
  const employee = await EmployeeService.updateEmployee(
    req.params.id,
    req.companyIds ?? [],
    parsed.data
  );
  if (!employee) {
    res.status(404).json({ success: false, error: 'Employee not found' });
    return;
  }
  res.json({ success: true, data: employee });
}));

// DELETE /api/employees/:id
router.delete('/:id', authMiddleware, routeHandler(async (req: Request, res: Response): Promise<void> => {
  const deleted = await EmployeeService.deleteEmployee(req.params.id, req.companyIds ?? []);
  if (!deleted) {
    res.status(404).json({ success: false, error: 'Employee not found' });
    return;
  }
  res.json({ success: true, data: null });
}));

export { router as employeeRouter };
