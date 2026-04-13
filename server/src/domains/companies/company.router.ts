import { Router, Request, Response } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { CompanyService } from './company.service';
import { EmployeeService } from '../employees/employee.service';
import { createCompanySchema, updateCompanySchema } from './company.schema';
import { createEmployeeSchema } from '../employees/employee.schema';
import { routeHandler, AppError } from '../../middleware/routeHandler';

const router = Router();

// GET /api/companies
router.get('/', authMiddleware, routeHandler(async (req: Request, res: Response): Promise<void> => {
  const companies = await CompanyService.getCompaniesByIds(req.companyIds ?? []);
  res.json({ success: true, data: companies });
}));

// POST /api/companies
router.post('/', authMiddleware, routeHandler(async (req: Request, res: Response): Promise<void> => {
  const parsed = createCompanySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: parsed.error.flatten().fieldErrors });
    return;
  }
  try {
    const company = await CompanyService.createCompany(
      req.userId!,
      parsed.data,
      req.hasSubscription ?? false
    );
    res.status(201).json({ success: true, data: company });
  } catch (error) {
    if (error instanceof Error && error.message === 'COMPANY_LIMIT_REACHED') {
      throw new AppError(422, 'COMPANY_LIMIT_REACHED');
    }
    throw error;
  }
}));

// GET /api/companies/:id
router.get('/:id', authMiddleware, routeHandler(async (req: Request, res: Response): Promise<void> => {
  const company = await CompanyService.getCompanyById(req.params.id, req.companyIds ?? []);
  if (!company) {
    res.status(404).json({ success: false, error: 'Company not found' });
    return;
  }
  res.json({ success: true, data: company });
}));

// PATCH /api/companies/:id
router.patch('/:id', authMiddleware, routeHandler(async (req: Request, res: Response): Promise<void> => {
  const parsed = updateCompanySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: parsed.error.flatten().fieldErrors });
    return;
  }
  const company = await CompanyService.updateCompany(
    req.params.id,
    req.companyIds ?? [],
    parsed.data
  );
  if (!company) {
    res.status(404).json({ success: false, error: 'Company not found' });
    return;
  }
  res.json({ success: true, data: company });
}));

// DELETE /api/companies/:id  (removes from user's list, no hard-delete)
router.delete('/:id', authMiddleware, routeHandler(async (req: Request, res: Response): Promise<void> => {
  const removed = await CompanyService.removeCompanyFromUser(req.params.id, req.userId!);
  if (!removed) {
    res.status(404).json({ success: false, error: 'Company not found' });
    return;
  }
  res.json({ success: true, data: null });
}));

// POST /api/companies/:id/employees
router.post('/:id/employees', authMiddleware, routeHandler(async (req: Request, res: Response): Promise<void> => {
  if (!(req.companyIds ?? []).includes(req.params.id)) {
    res.status(404).json({ success: false, error: 'Company not found' });
    return;
  }
  const parsed = createEmployeeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: parsed.error.flatten().fieldErrors });
    return;
  }
  try {
    const employee = await EmployeeService.createEmployee(
      req.params.id,
      req.companyIds ?? [],
      parsed.data,
      req.hasSubscription ?? false
    );
    res.status(201).json({ success: true, data: employee });
  } catch (error) {
    if (error instanceof Error && error.message === 'EMPLOYEE_LIMIT_REACHED') {
      throw new AppError(422, 'EMPLOYEE_LIMIT_REACHED');
    }
    throw error;
  }
}));

export { router as companyRouter };
