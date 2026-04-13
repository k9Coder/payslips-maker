import { Request, Response, NextFunction } from 'express';

export function subscriptionMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (!req.hasSubscription) {
    res.status(403).json({ success: false, error: 'SUBSCRIPTION_REQUIRED' });
    return;
  }
  next();
}
