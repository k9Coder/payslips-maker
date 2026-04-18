declare namespace Express {
  interface Request {
    clerkId?: string;
    userId?: string;
    isAdmin?: boolean;
    hasSubscription?: boolean;
    impersonating?: boolean;
    impersonatedUserId?: string;
    requestId?: string;
    startTime?: number;
  }
}
