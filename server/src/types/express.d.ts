import type { ISubscription } from '@payslips-maker/shared';

declare global {
  namespace Express {
    interface Request {
      clerkId?:             string;
      userId?:              string;
      isAdmin?:             boolean;
      activeSubscriptions?: ISubscription[];
      impersonating?:       boolean;
      impersonatedUserId?:  string;
      requestId?:           string;
      startTime?:           number;
    }
  }
}

export {};
