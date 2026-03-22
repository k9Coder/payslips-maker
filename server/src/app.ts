import './infrastructure/env'; // validate env first
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { env } from './infrastructure/env';
import { connectDB } from './infrastructure/database/mongodb';
import { logger } from './infrastructure/logger/logger';
import { clerkWebhookRouter } from './webhooks/clerk.webhook';
import { userRouter } from './domains/users/user.router';
import { formRouter } from './domains/forms/form.router';
import { adminRouter } from './domains/admin/admin.router';

const app = express();

// CRITICAL: Webhook route must be registered BEFORE express.json()
// svix requires raw body as Buffer for signature verification
app.use('/api/webhooks/clerk', express.raw({ type: 'application/json' }), clerkWebhookRouter);

// Body parsing for all other routes
app.use(express.json());

// CORS
app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true,
  })
);

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/users', userRouter);
app.use('/api/forms', formRouter);
app.use('/api/admin', adminRouter);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({ success: false, error: 'Internal server error' });
});

async function start(): Promise<void> {
  await connectDB();
  const port = Number(env.PORT);
  app.listen(port, () => {
    logger.info(`Server running on port ${port}`, { env: env.NODE_ENV });
  });
}

start().catch((err) => {
  logger.error('Failed to start server', { error: String(err) });
  process.exit(1);
});

export default app;
