declare global {
  namespace Express {
    // Đây là payload mà JWT chứa — gateway chỉ decode ra chừng này
    interface AuthUser {
      id: number | string;
      email: string;
      role: string;
      iat?: number;
      exp?: number;
    }

    interface Request {
      user?: AuthUser; // để phòng trường hợp chưa login
    }
  }
}

export {};
