import { Request, Response, NextFunction } from 'express';

export function adminMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.isAdmin) {
    res.status(403).json({ success: false, error: 'Forbidden: admin access required' });
    return;
  }
  next();
}
