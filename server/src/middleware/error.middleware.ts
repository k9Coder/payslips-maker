import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from './routeHandler';
import { logger } from '../infrastructure/logger/logger';

export const errorMiddleware = (err: Error, req: Request, res: Response, _next: NextFunction): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, error: err.code });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({ success: false, error: err.errors.map((e) => e.message).join(', ') });
    return;
  }

  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    requestId: req.requestId,
  });
  res.status(500).json({ success: false, error: 'Internal server error' });
};
