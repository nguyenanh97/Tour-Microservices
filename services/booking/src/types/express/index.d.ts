import 'express';
declare global {
  namespace Express {
    interface UserPayload {
      id?: string;
      role?: string;
      [key: string]: any;
    }
    interface Request {
      user?: UserPayload;
    }
  }
}

export {};
