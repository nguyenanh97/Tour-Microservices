import 'express';

declare global {
  namespace Express {
    interface User {
      id: number;
      role: 'admin' | 'user' | 'guide' | 'lead-guide';
      verified: boolean;
      email?: string;
      name?: string;
      active?: boolean;
      [key: string]: any;
    }

    interface Request {
      user?: User;
    }
  }
}

export {};
