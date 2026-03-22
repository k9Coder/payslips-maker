declare namespace Express {
  interface Request {
    clerkId?: string;
    userId?: string;
    isAdmin?: boolean;
  }
}
