import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./email-log.model', () => ({
  EmailLog: {
    countDocuments: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('@sendgrid/mail', () => ({
  default: { setApiKey: vi.fn(), send: vi.fn() },
}));

vi.mock('../../infrastructure/env', () => ({
  env: {
    SENDGRID_API_KEY: 'SG.test',
    EMAIL_FROM: 'noreply@test.com',
  },
}));

vi.mock('../../infrastructure/logger/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn() },
}));

import { EmailService } from './email.service';
import { EmailLog } from './email-log.model';
import sgMail from '@sendgrid/mail';

const mockLog = EmailLog as unknown as Record<string, ReturnType<typeof vi.fn>>;
const mockSg = sgMail as unknown as Record<string, ReturnType<typeof vi.fn>>;

const FORM_ID = '507f1f77bcf86cd799439011';
const USER_ID = '507f1f77bcf86cd799439022';

beforeEach(() => vi.clearAllMocks());

// ─── canSendEmail ─────────────────────────────────────────────────────────────

describe('EmailService.canSendEmail', () => {
  it('returns true when 0 emails sent today', async () => {
    mockLog.countDocuments.mockResolvedValue(0);
    await expect(EmailService.canSendEmail(FORM_ID, USER_ID)).resolves.toBe(true);
  });

  it('returns true when 2 emails sent today', async () => {
    mockLog.countDocuments.mockResolvedValue(2);
    await expect(EmailService.canSendEmail(FORM_ID, USER_ID)).resolves.toBe(true);
  });

  it('returns false when 3 emails sent today (limit reached)', async () => {
    mockLog.countDocuments.mockResolvedValue(3);
    await expect(EmailService.canSendEmail(FORM_ID, USER_ID)).resolves.toBe(false);
  });

  it('returns false when over the limit', async () => {
    mockLog.countDocuments.mockResolvedValue(5);
    await expect(EmailService.canSendEmail(FORM_ID, USER_ID)).resolves.toBe(false);
  });
});

// ─── getRemainingEmailsToday ──────────────────────────────────────────────────

describe('EmailService.getRemainingEmailsToday', () => {
  it('returns 3 when 0 emails sent', async () => {
    mockLog.countDocuments.mockResolvedValue(0);
    await expect(EmailService.getRemainingEmailsToday(FORM_ID, USER_ID)).resolves.toBe(3);
  });

  it('returns 1 when 2 emails sent', async () => {
    mockLog.countDocuments.mockResolvedValue(2);
    await expect(EmailService.getRemainingEmailsToday(FORM_ID, USER_ID)).resolves.toBe(1);
  });

  it('returns 0 when limit is reached', async () => {
    mockLog.countDocuments.mockResolvedValue(3);
    await expect(EmailService.getRemainingEmailsToday(FORM_ID, USER_ID)).resolves.toBe(0);
  });

  it('never returns negative (clamps at 0)', async () => {
    mockLog.countDocuments.mockResolvedValue(10);
    await expect(EmailService.getRemainingEmailsToday(FORM_ID, USER_ID)).resolves.toBe(0);
  });
});

// ─── sendFormEmail ────────────────────────────────────────────────────────────

describe('EmailService.sendFormEmail', () => {
  const PARAMS = {
    formId: FORM_ID,
    userId: USER_ID,
    toEmail: 'ana@example.com',
    toName: 'Ana Ramirez',
    senderName: 'Test Employer',
    subject: 'תלוש שכר',
    pdfBuffer: Buffer.from('fake-pdf'),
    pdfFilename: 'payslip.pdf',
  };

  it('throws EMAIL_RATE_LIMIT_REACHED when limit is reached', async () => {
    mockLog.countDocuments.mockResolvedValue(3);

    await expect(EmailService.sendFormEmail(PARAMS)).rejects.toThrow('EMAIL_RATE_LIMIT_REACHED');
    expect(mockSg.send).not.toHaveBeenCalled();
  });

  it('calls sgMail.send and creates an EmailLog on success', async () => {
    mockLog.countDocuments.mockResolvedValue(0);
    mockSg.send.mockResolvedValue([{ statusCode: 202 }, {}]);
    mockLog.create.mockResolvedValue({});

    await EmailService.sendFormEmail(PARAMS);

    expect(mockSg.send).toHaveBeenCalledOnce();
    expect(mockLog.create).toHaveBeenCalledOnce();
  });

  it('sends to the correct recipient email', async () => {
    mockLog.countDocuments.mockResolvedValue(0);
    mockSg.send.mockResolvedValue([{ statusCode: 202 }, {}]);
    mockLog.create.mockResolvedValue({});

    await EmailService.sendFormEmail(PARAMS);

    const sendArg = mockSg.send.mock.calls[0][0] as Record<string, unknown>;
    expect((sendArg.to as { email: string }).email).toBe('ana@example.com');
  });

  it('attaches the PDF as base64', async () => {
    mockLog.countDocuments.mockResolvedValue(0);
    mockSg.send.mockResolvedValue([{ statusCode: 202 }, {}]);
    mockLog.create.mockResolvedValue({});

    await EmailService.sendFormEmail(PARAMS);

    const sendArg = mockSg.send.mock.calls[0][0] as Record<string, unknown>;
    const attachments = sendArg.attachments as Array<{ filename: string; type: string }>;
    expect(attachments[0].filename).toBe('payslip.pdf');
    expect(attachments[0].type).toBe('application/pdf');
  });

  it('does not create an EmailLog if sgMail.send throws', async () => {
    mockLog.countDocuments.mockResolvedValue(0);
    mockSg.send.mockRejectedValue(new Error('SendGrid error'));

    await expect(EmailService.sendFormEmail(PARAMS)).rejects.toThrow('SendGrid error');
    expect(mockLog.create).not.toHaveBeenCalled();
  });
});
