import { Request, Response, NextFunction } from 'express';

export const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const id = req.headers['x-request-id'];
  console.log(`[${new Date().toISOString()}] [${id}] ${req.method} ${req.url}`);
  next();
};