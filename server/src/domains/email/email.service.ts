import sgMail from '@sendgrid/mail';
import { Types } from 'mongoose';
import { EmailLog } from './email-log.model';
import { env } from '../../infrastructure/env';
import { logger } from '../../infrastructure/logger/logger';

if (env.SENDGRID_API_KEY) {
  sgMail.setApiKey(env.SENDGRID_API_KEY);
}

const DAILY_SEND_LIMIT = 3;

export const EmailService = {
  async canSendEmail(formId: string, userId: string): Promise<boolean> {
    const count = await EmailLog.countDocuments({
      formId: new Types.ObjectId(formId),
      userId: new Types.ObjectId(userId),
    });
    return count < DAILY_SEND_LIMIT;
  },

  async getRemainingEmailsToday(formId: string, userId: string): Promise<number> {
    const count = await EmailLog.countDocuments({
      formId: new Types.ObjectId(formId),
      userId: new Types.ObjectId(userId),
    });
    return Math.max(0, DAILY_SEND_LIMIT - count);
  },

  async sendFormEmail(params: {
    formId: string;
    userId: string;
    toEmail: string;
    toName: string;
    senderName: string;
    subject: string;
    pdfBuffer: Buffer;
    pdfFilename: string;
  }): Promise<void> {
    if (!env.SENDGRID_API_KEY) {
      throw new Error('SENDGRID_NOT_CONFIGURED');
    }

    const canSend = await EmailService.canSendEmail(params.formId, params.userId);
    if (!canSend) {
      throw new Error('EMAIL_RATE_LIMIT_REACHED');
    }

    await sgMail.send({
      to: { email: params.toEmail, name: params.toName },
      from: { email: env.EMAIL_FROM, name: params.senderName },
      subject: params.subject,
      text: `שלום ${params.toName},\n\nמצורף המסמך שלך.\n\nבברכה,\n${params.senderName}`,
      html: `<p>שלום ${params.toName},</p><p>מצורף המסמך שלך.</p><p>בברכה,<br>${params.senderName}</p>`,
      attachments: [
        {
          content: params.pdfBuffer.toString('base64'),
          filename: params.pdfFilename,
          type: 'application/pdf',
          disposition: 'attachment',
        },
      ],
    });

    await EmailLog.create({
      formId: new Types.ObjectId(params.formId),
      userId: new Types.ObjectId(params.userId),
      toEmail: params.toEmail,
    });

    logger.info('Email sent', { formId: params.formId, toEmail: params.toEmail });
  },
};
