import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Response, NextFunction } from 'express';
import { ITokenRequest } from '../interfaces/TokenRequest';
import AppError from '../utils/appError';
import httpStatusText from '../utils/httpStatusText';
import AsyncError from './asyncErrorWrapper';
dotenv.config();

const validateTokenFunction =
  (allowed_account_types: string[]) => async (req: ITokenRequest) => {
    const token_header = process.env.TOKEN_HEADER_KEY || '';
    if (!token_header) {
      const err = new AppError(
        'Token header not provided',
        500,
        httpStatusText.ERROR
      );
      throw err;
    }

    const token = String(req.headers[token_header] || '');
    if (!token) {
      const err = new AppError('Token not provided', 401, httpStatusText.FAIL);
      throw err;
    }

    const secret = process.env.JWT_SECRET || '';
    if (!secret) {
      const err = new AppError(
        'JWT secret key is not provided',
        500,
        httpStatusText.ERROR
      );
      throw err;
    }
    const verified = await jwt.verify(token, secret);
    if (!verified) {
      const err = new AppError('Invalid token', 401, httpStatusText.FAIL);
      throw err;
    }

    if (
      !allowed_account_types.includes((verified as jwt.JwtPayload).account_type)
    ) {
      throw new AppError(
        'Not allowed to access this resource',
        403,
        httpStatusText.FAIL
      );
    }
    req.jwt_data = verified as jwt.JwtPayload;
  };

const validateToken = (allowed_account_types: string[]) =>
  AsyncError(async (req: ITokenRequest, res: Response, next: NextFunction) => {
    await validateTokenFunction(allowed_account_types)(req);
    next();
  });

export default validateToken;
export { validateTokenFunction };
