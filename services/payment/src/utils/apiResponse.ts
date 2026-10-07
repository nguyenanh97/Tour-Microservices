import { Response } from 'express';

export const sendResponse = {
  success<T>(
    res: Response,
    data: T,
    statusCode: number = 200,
    status: string = 'success',
  ): Response {
    return res.status(statusCode).json({
      status,
      data,
    });
  },
  list<T>(res: Response, docs: T[], statusCode: number = 200): Response {
    return res.status(statusCode).json({
      status: 'success',
      result: docs.length,
      data: { data: docs },
    });
  },
  create<T>(res: Response, docs: T): Response {
    return res.status(201).json({
      status: 'success',
      data: docs,
    });
  },
};
