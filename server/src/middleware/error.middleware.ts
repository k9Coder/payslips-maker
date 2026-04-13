import { Request, Response, NextFunction } from 'express';
import { AppError } from './routeHandler';
import { logger } from '../infrastructure/logger/logger';

export const errorMiddleware = (err: Error, req: Request, res: Response, _next: NextFunction): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, error: err.code });
    return;
  }

  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    requestId: req.requestId,
  });
  res.status(500).json({ success: false, error: 'Internal server error' });
};
