import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { authMiddleware } from '../../middleware/auth.middleware';
import { subscriptionMiddleware } from '../../middleware/subscription.middleware';
import { FormService } from './form.service';
import { Form } from './form.model';
import { EmailService } from '../email/email.service';
import { getEmployeeById } from '../employees/employee.service';
import { UserService } from '../users/user.service';
import { createFormSchema, updateFormSchema } from './form.schema';
import { sendEmailSchema } from '../email/email.schema';
import { routeHandler, AppError } from '../../middleware/routeHandler';
import { resolveMultiLangString } from '@payslips-maker/shared';
import type { FormType } from '@payslips-maker/shared';

const router = Router();

// GET /api/forms/summary — must be before /:id route
router.get('/summary', authMiddleware, routeHandler(async (req: Request, res: Response): Promise<void> => {
  const now = new Date();
  const [count, thisMonth] = await Promise.all([
    Form.countDocuments({ userId: new mongoose.Types.ObjectId(req.userId!) }),
    Form.countDocuments({
      userId: new mongoose.Types.ObjectId(req.userId!),
      'period.year': now.getFullYear(),
      'period.month': now.getMonth() + 1,
    }),
  ]);
  res.json({ data: { count, thisMonth } });
}));

// GET /api/forms?employeeId=&formType=&month=&year=
router.get('/', authMiddleware, routeHandler(async (req: Request, res: Response): Promise<void> => {
  const filters = {
    employeeId: req.query.employeeId as string | undefined,
    formType: req.query.formType as FormType | undefined,
    month: req.query.month ? Number(req.query.month) : undefined,
    year: req.query.year ? Number(req.query.year) : undefined,
  };
  const forms = await FormService.getUserForms(req.userId!, filters);
  res.json({ success: true, data: forms });
}));

// POST /api/forms
router.post('/', authMiddleware, routeHandler(async (req: Request, res: Response): Promise<void> => {
  const parsed = createFormSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: parsed.error.flatten().fieldErrors });
    return;
  }

  const user = await UserService.getUserByClerkId(req.clerkId!);
  const producedByName = user?.fullName ?? '';
  try {
    const form = await FormService.createForm(
      req.clerkId!,
      req.userId!,
      producedByName,
      parsed.data,
      req.hasSubscription
    );
    res.status(201).json({ success: true, data: form });
  } catch (error) {
    if (error instanceof Error && error.message === 'FORM_LIMIT_REACHED') {
      throw new AppError(422, 'FORM_LIMIT_REACHED');
    }
    throw error;
  }
}));

// GET /api/forms/:id
router.get('/:id', authMiddleware, routeHandler(async (req: Request, res: Response): Promise<void> => {
  const form = await FormService.getFormById(req.params.id, req.userId!);
  if (!form) {
    res.status(404).json({ success: false, error: 'Form not found' });
    return;
  }
  res.json({ success: true, data: form });
}));

// PUT /api/forms/:id
router.put('/:id', authMiddleware, routeHandler(async (req: Request, res: Response): Promise<void> => {
  const parsed = updateFormSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: parsed.error.flatten().fieldErrors });
    return;
  }

  const form = await FormService.updateForm(req.params.id, req.userId!, parsed.data);
  if (!form) {
    res.status(404).json({ success: false, error: 'Form not found' });
    return;
  }
  res.json({ success: true, data: form });
}));

// DELETE /api/forms/:id
router.delete('/:id', authMiddleware, routeHandler(async (req: Request, res: Response): Promise<void> => {
  const deleted = await FormService.deleteForm(req.params.id, req.userId!);
  if (!deleted) {
    res.status(404).json({ success: false, error: 'Form not found' });
    return;
  }
  res.json({ success: true, data: null });
}));

// GET /api/forms/:id/send-email/status
router.get('/:id/send-email/status', authMiddleware, routeHandler(async (req: Request, res: Response): Promise<void> => {
  const remaining = await EmailService.getRemainingEmailsToday(req.params.id, req.userId!);
  res.json({ success: true, data: { remaining, limit: 3 } });
}));

// POST /api/forms/:id/send-email
router.post('/:id/send-email', authMiddleware, subscriptionMiddleware, routeHandler(async (req: Request, res: Response): Promise<void> => {
  const parsed = sendEmailSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: parsed.error.flatten().fieldErrors });
    return;
  }

  const form = await FormService.getFormById(req.params.id, req.userId!);
  if (!form) {
    res.status(404).json({ success: false, error: 'Form not found' });
    return;
  }

  const employee = await getEmployeeById(form.employeeId.toString(), req.userId!);
  if (!employee) {
    res.status(404).json({ success: false, error: 'Employee not found' });
    return;
  }

  const toEmail = parsed.data.toEmail ?? employee.email;
  if (!toEmail) {
    res.status(422).json({ success: false, error: 'EMPLOYEE_NO_EMAIL' });
    return;
  }

  const user = await UserService.getUserByClerkId(req.clerkId!);
  const pdfBuffer = Buffer.from(parsed.data.pdfBase64, 'base64');
  const isPayslip = form.formType === 'payslip';
  const filename = isPayslip
    ? `payslip_${form.period?.month}_${form.period?.year}.pdf`
    : `final_settlement.pdf`;

  try {
    await EmailService.sendFormEmail({
      formId: req.params.id,
      userId: req.userId!,
      toEmail,
      toName: resolveMultiLangString(employee.fullName, 'he'),
      senderName: user?.fullName ?? 'מעסיק',
      subject: isPayslip
        ? `תלוש שכר – ${form.period?.month}/${form.period?.year}`
        : `גמר חשבון – ${resolveMultiLangString(employee.fullName, 'he')}`,
      pdfBuffer,
      pdfFilename: filename,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'EMAIL_RATE_LIMIT_REACHED') {
      throw new AppError(429, 'EMAIL_RATE_LIMIT_REACHED');
    }
    if (error instanceof Error && error.message === 'SENDGRID_NOT_CONFIGURED') {
      throw new AppError(503, 'SENDGRID_NOT_CONFIGURED');
    }
    throw error;
  }

  const remaining = await EmailService.getRemainingEmailsToday(req.params.id, req.userId!);
  res.json({ success: true, data: { remaining } });
}));

export { router as formRouter };
