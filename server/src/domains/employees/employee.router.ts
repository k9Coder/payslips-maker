import { Router } from 'express';
import mongoose from 'mongoose';
import { authMiddleware } from '../../middleware/auth.middleware';
import {
  getEmployeesByUser,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from './employee.service';
import { Employee } from './employee.model';
import { createEmployeeSchema, updateEmployeeSchema } from './employee.schema';
import { routeHandler } from '../../middleware/routeHandler';
import { checkGate, Feature } from '../subscriptions/subscription.gates';

const router = Router();
router.use(authMiddleware);

router.get('/', routeHandler(async (req, res) => {
  const employees = await getEmployeesByUser(req.userId!);
  res.json({ data: employees });
}));

router.post('/', routeHandler(async (req, res) => {
  const existingCount = await Employee.countDocuments({
    userId: new mongoose.Types.ObjectId(req.userId!),
  });

  if (existingCount >= 1) {
    const result = checkGate(Feature.CREATE_ADDITIONAL_EMPLOYEE, req.activeSubscriptions ?? []);
    if (!result.allowed) {
      res.status(403).json({ success: false, error: result.reason });
      return;
    }
  }

  const body = createEmployeeSchema.parse(req.body);
  const employee = await createEmployee(req.userId!, body);
  res.status(201).json({ data: employee });
}));

router.get('/:id', routeHandler(async (req, res) => {
  // Admins can fetch any employee by ID (e.g. while impersonating)
  const employee = req.isAdmin
    ? await getEmployeeById(req.params.id)
    : await getEmployeeById(req.params.id, req.userId!);
  if (!employee) {
    res.status(404).json({ error: 'Employee not found' });
    return;
  }
  res.json({ data: employee });
}));

router.patch('/:id', routeHandler(async (req, res) => {
  const body = updateEmployeeSchema.parse(req.body);
  const employee = await updateEmployee(req.params.id, req.userId!, body);
  if (!employee) {
    res.status(404).json({ error: 'Employee not found' });
    return;
  }
  res.json({ data: employee });
}));

router.delete('/:id', routeHandler(async (req, res) => {
  await deleteEmployee(req.params.id, req.userId!);
  res.status(204).send();
}));

export { router as employeeRouter };
