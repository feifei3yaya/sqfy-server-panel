import { NextFunction, Request, Response } from 'express';

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({ message: '接口不存在' });
};

export const errorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(error);
  }
  const statusCode = typeof error?.statusCode === 'number' ? error.statusCode : 500;
  const message = typeof error?.message === 'string' && error.message.trim().length > 0
    ? error.message
    : '服务器内部错误';
  res.status(statusCode).json({ message });
};
