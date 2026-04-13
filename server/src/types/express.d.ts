declare namespace Express {
  interface Request {
    clerkId?: string;
    userId?: string;
    isAdmin?: boolean;
    hasSubscription?: boolean;
    companyIds?: string[];
    impersonating?: boolean;
    impersonatedUserId?: string;
    requestId?: string;
    startTime?: number;
  }
}
