import { Response, Request, NextFunction } from 'express';
import AppError from '../utils/appError';
import httpStatusText from '../utils/httpStatusText';
interface AsyncFunction {
  (req: Request, res: Response, next: NextFunction): Promise<unknown>;
}

export default (asyncFn: AsyncFunction) => {
  return (req: Request, res: Response, next: NextFunction) => {
    asyncFn(req, res, next).catch((error: unknown) => {
      let errorMessage = 'An unknown error occurred';
      let statusCode = 400;
      let statusText = httpStatusText.FAIL;
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      if (error instanceof AppError) {
        errorMessage = error.message;
        statusCode = error.statusCode;
        statusText = error.statusText;
      }
      const err = new AppError(errorMessage, statusCode, statusText);
      next(err);
    });
  };
};
