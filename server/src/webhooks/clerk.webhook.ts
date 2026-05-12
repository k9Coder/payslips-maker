import { Router, Request, Response } from 'express';
import { Webhook } from 'svix';
import { UserService } from '../domains/users/user.service';
import { env } from '../infrastructure/env';
import { logger } from '../infrastructure/logger/logger';

const ALLOWED_EMAILS = ['ariel@isavta.co.il', 'yarinmagdaci@gmail.com', 'yarin0600@gmail.com', 'omermfla@gmail.com'];

const router = Router();

interface ClerkUserCreatedEvent {
  type: 'user.created';
  data: {
    id: string;
    email_addresses: Array<{ email_address: string; id: string }>;
    first_name: string | null;
    last_name: string | null;
  };
}

type ClerkWebhookEvent = ClerkUserCreatedEvent | { type: string; data: unknown };

router.post('/', async (req: Request, res: Response): Promise<void> => {
  logger.info('Clerk webhook received', { 
    headers: req.headers,
    bodyType: typeof req.body,
    bodyLength: Buffer.isBuffer(req.body) ? req.body.length : 'N/A'
  });

  const svixId = req.headers['svix-id'] as string;
  const svixTimestamp = req.headers['svix-timestamp'] as string;
  const svixSignature = req.headers['svix-signature'] as string;

  if (!svixId || !svixTimestamp || !svixSignature) {
    logger.warn('Missing svix headers', { svixId, svixTimestamp, svixSignature });
    res.status(400).json({ error: 'Missing svix headers' });
    return;
  }

  const wh = new Webhook(env.CLERK_WEBHOOK_SECRET);
  let event: ClerkWebhookEvent;

  try {
    event = wh.verify(req.body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkWebhookEvent;
    logger.info('Webhook verified', { eventType: event.type });
  } catch (error) {
    logger.warn('Clerk webhook verification failed', { error: String(error) });
    res.status(400).json({ error: 'Webhook verification failed' });
    return;
  }

  if (event.type === 'user.created') {
    const { id, email_addresses, first_name, last_name } = (event as ClerkUserCreatedEvent).data;
    const email = email_addresses[0]?.email_address ?? '';
    const fullName = `${first_name ?? ''} ${last_name ?? ''}`.trim() || email;
    const isAdmin = ALLOWED_EMAILS.includes(email);

    logger.info('Processing user.created event', { clerkId: id, email, fullName, isAdmin });

    try {
      const result = await UserService.createUserFromClerk(id, email, fullName, isAdmin);
      logger.info('User created via webhook', { clerkId: id, email, mongoId: result._id, isAdmin });
    } catch (error) {
      logger.error('Failed to create user from webhook', { 
        error: String(error), 
        clerkId: id,
        stack: error instanceof Error ? error.stack : 'N/A'
      });
    }
  } else {
    logger.info('Webhook event type not user.created', { eventType: event.type });
  }

  res.status(200).json({ received: true });
});

export { router as clerkWebhookRouter };
