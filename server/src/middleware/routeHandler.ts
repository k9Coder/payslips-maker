import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message?: string
  ) {
    super(message ?? code);
    this.name = 'AppError';
  }
}

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

export const routeHandler = (fn: AsyncRequestHandler) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await fn(req, res, next);
    } catch (err) {
      next(err);
    }
  };
