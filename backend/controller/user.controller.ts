import httpStatusText from '../utils/httpStatusText';
import accountTypes from '../utils/accountTypes';
import { IUserModel } from '../interfaces/UserModel';
import { Request, Response, NextFunction } from 'express';
import { generateToken, validateUser } from '../utils/loginUtils';
import AsyncError from '../middlewares/asyncErrorWrapper';
import appError from '../utils/appError';
import mongoose from 'mongoose';
import { ITokenRequest } from '../interfaces/TokenRequest';
import { JwtPayload } from 'jsonwebtoken';

const deleteCollection = async (collectionName: string) => {
  if (!mongoose.connection.readyState) {
    throw new Error('Database connection is not established');
  }

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database object is not available');
  }

  return await db.dropCollection(collectionName);
};

const userLogin = (account_type: string) =>
  AsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body;
    if (!accountTypes.ALL.includes(account_type)) {
      const err = new appError(
        'Invalid account type',
        400,
        httpStatusText.FAIL
      );
      return next(err);
    }

    const user = await validateUser(body.email, body.password, account_type);
    if (!user) {
      const err = new appError(
        'Invalid email or password',
        400,
        httpStatusText.FAIL
      );
      return next(err);
    }

    const expiresIn = body.expiresIn || process.env.TOKEN_EXPIRES_IN || '';
    if (!expiresIn) {
      const err = new appError(
        'Token expiration time not provided',
        500,
        httpStatusText.ERROR
      );
      return next(err);
    }

    const token = await generateToken(
      body.email,
      body.password,
      account_type,
      expiresIn
    );

    if (!process.env.TOKEN_HEADER_KEY) {
      const err = new appError(
        'Token header key not provided',
        500,
        httpStatusText.ERROR
      );
      return next(err);
    }
    res.json({
      status: httpStatusText.SUCCESS,
      data: {
        [process.env.TOKEN_HEADER_KEY || '']: token,
        email: body.email,
        account_type: account_type,
      },
    });
  });

const deleteThis = (account_type: string) =>
  AsyncError(async (req: ITokenRequest, res: Response, next: NextFunction) => {
    const jwt_data = req.jwt_data as JwtPayload;
    const userModel = mongoose.model(
      ...accountTypes.ModelArgs[
        account_type as keyof typeof accountTypes.ModelArgs
      ]
    );
    const user = await (userModel as unknown as IUserModel).findOneAndDelete({
      'user.email': jwt_data.email,
    });
    if (!user) {
      const err = new appError('User not found', 404, httpStatusText.FAIL);
      return next(err);
    }
    res.json({ status: httpStatusText.SUCCESS, data: { user } });
  });

const getThis = (account_type: string) =>
  AsyncError(async (req: ITokenRequest, res: Response, next: NextFunction) => {
    const jwt_data = req.jwt_data as JwtPayload;
    const userModel = mongoose.model(
      ...accountTypes.ModelArgs[
        account_type as keyof typeof accountTypes.ModelArgs
      ]
    );
    const user = await (userModel as unknown as IUserModel).findOne({
      'user.email': jwt_data.email,
    });
    if (!user) {
      const err = new appError('Seller not found', 404, httpStatusText.FAIL);
      return next(err);
    }
    res.json({ status: httpStatusText.SUCCESS, data: { user } });
  });

export { userLogin, deleteCollection, deleteThis, getThis };
