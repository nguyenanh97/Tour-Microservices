import 'express';

declare global {
  namespace Express {
    interface AuthUser {
      sub?: string;
      id?: string;
      role?: string;
      [key: string]: any;
    }
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
