import { Request, Response, NextFunction } from 'express';
import { logger } from '../infrastructure/logger/logger';

export const requestLoggerMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const requestId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  req.requestId = requestId;
  req.startTime = Date.now();

  logger.info('Request Started', {
    requestId,
    method: req.method,
    path: req.originalUrl,
    query: Object.keys(req.query).length ? req.query : undefined,
    ip: (req.headers['x-forwarded-for'] as string) ?? req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.on('finish', () => {
    const durationMs = Date.now() - req.startTime!;
    const { statusCode } = res;

    const meta = {
      requestId,
      method: req.method,
      path: req.originalUrl,
      params: Object.keys(req.params).length ? req.params : undefined,
      statusCode,
      durationMs,
      userId: req.userId,
    };

    if (statusCode >= 500) {
      logger.error('Request Failed', meta);
    } else if (statusCode >= 400) {
      logger.warn('Request Failed', meta);
    } else {
      logger.info('Request Completed', meta);
    }
  });

  next();
};
