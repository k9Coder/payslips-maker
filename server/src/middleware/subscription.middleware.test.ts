import { describe, it, expect, vi } from 'vitest';
import { subscriptionMiddleware } from './subscription.middleware';
import type { Request, Response, NextFunction } from 'express';

function makeRes() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res as unknown as Response;
}

describe('subscriptionMiddleware', () => {
  it('calls next() when req.hasSubscription is true', () => {
    const req = { hasSubscription: true } as Request;
    const res = makeRes();
    const next = vi.fn() as NextFunction;

    subscriptionMiddleware(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 403 SUBSCRIPTION_REQUIRED when hasSubscription is false', () => {
    const req = { hasSubscription: false } as Request;
    const res = makeRes();
    const next = vi.fn() as NextFunction;

    subscriptionMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'SUBSCRIPTION_REQUIRED' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 403 when hasSubscription is undefined', () => {
    const req = {} as Request;
    const res = makeRes();
    const next = vi.fn() as NextFunction;

    subscriptionMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
