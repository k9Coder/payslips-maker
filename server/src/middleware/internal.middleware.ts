import { Request, Response, NextFunction } from 'express';
import { env } from '../infrastructure/env';

export function internalMiddleware(req: Request, res: Response, next: NextFunction): void {
  const secret = req.headers['x-internal-secret'];
  if (secret !== env.INTERNAL_API_SECRET) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }
  next();
}
