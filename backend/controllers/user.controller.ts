import httpStatusText from '../utils/httpStatusText';
import accountTypes from '../utils/accountTypes';
import { Request, Response, NextFunction } from 'express';
import { generateToken, validateUser } from '../utils/loginUtils';
import AsyncError from '../middlewares/asyncErrorWrapper';
import AppError from '../utils/appError';
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
      const err = new AppError(
        'Invalid account type',
        400,
        httpStatusText.FAIL
      );
      return next(err);
    }

    const user = await validateUser(body.email, body.password, account_type);
    if (!user) {
      const err = new AppError(
        'Invalid email or password',
        400,
        httpStatusText.FAIL
      );
      return next(err);
    }

    const expiresIn = body.expiresIn || process.env.TOKEN_EXPIRES_IN || '1s';
    if (!expiresIn) {
      const err = new AppError(
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
      const err = new AppError(
        'Token header key not provided',
        500,
        httpStatusText.ERROR
      );
      return next(err);
    }
    res.json({
      status: httpStatusText.SUCCESS,
      data: {
        [process.env.TOKEN_HEADER_KEY]: token,
        email: body.email,
        account_type: account_type,
      },
    });
  });

const deleteUserFromToken = (account_type: string) =>
  AsyncError(async (req: ITokenRequest, res: Response, next: NextFunction) => {
    const jwt_data = req.jwt_data as JwtPayload;
    const model_args =
      accountTypes.ModelArgs[
        account_type as keyof typeof accountTypes.ModelArgs
      ];
    const userModel = mongoose.model(model_args[0], model_args[1]);
    const user = await userModel
      .findOneAndDelete({
        'user.email': jwt_data.email,
      })
      .lean()
      .select('-user.password -user._id -__v  -user.updated_at');
    if (!user) {
      const err = new AppError('User not found', 404, httpStatusText.FAIL);
      return next(err);
    }
    res.json({ status: httpStatusText.SUCCESS, data: user });
  });

const getUserFromToken = (account_type: string) =>
  AsyncError(async (req: ITokenRequest, res: Response, next: NextFunction) => {
    const jwt_data = req.jwt_data as JwtPayload;
    const model_args =
      accountTypes.ModelArgs[
        account_type as keyof typeof accountTypes.ModelArgs
      ];
    const userModel = mongoose.model(model_args[0], model_args[1]);
    const user = await userModel
      .findOne({
        'user.email': jwt_data.email,
      })
      .lean()
      .select('-user.password -user._id -__v  -user.updated_at');
    if (!user) {
      const err = new AppError('User not found', 404, httpStatusText.FAIL);
      return next(err);
    }
    res.json({ status: httpStatusText.SUCCESS, data: user });
  });

const getUserModel = (account_type: string) => {
  const args =
    accountTypes.ModelArgs[account_type as keyof typeof accountTypes.ModelArgs];
  const userModel = mongoose.model(args[0], args[1]);
  if (!userModel) {
    throw new AppError('Model not found', 500, httpStatusText.ERROR);
  }
  return userModel;
};

const verifyUserFromToken = async (req: ITokenRequest) => {
  const jwt_data = req.jwt_data as JwtPayload;
  const userModel = getUserModel(jwt_data.account_type);
  const user = await userModel.findOne({ 'user.email': jwt_data.email });
  if (!user) {
    throw new AppError('User not found', 404, httpStatusText.FAIL);
  }
  return user;
};

const getAllUsersByType = (get_type: string) =>
  AsyncError(async (req: ITokenRequest, res: Response) => {
    await verifyUserFromToken(req);

    // Get user model from get_type
    const args =
      accountTypes.ModelArgs[get_type as keyof typeof accountTypes.ModelArgs];
    const userModel = mongoose.model(args[0], args[1]);
    const users = await userModel
      .find({})
      .lean()
      .select('-user.password -user._id -__v  -user.updated_at');
    res.json({ status: httpStatusText.SUCCESS, data: users });
  });

const deleteAllUsersInCollection = (collectionName: string) =>
  AsyncError(async (req: ITokenRequest, res: Response, next: NextFunction) => {
    await verifyUserFromToken(req);
    const result = await deleteCollection(collectionName);
    if (!result) {
      const err = new AppError(
        `No ${collectionName} found`,
        404,
        httpStatusText.FAIL
      );
      return next(err);
    }
    res.json({
      status: httpStatusText.SUCCESS,
      data: { message: `All ${collectionName} deleted` },
    });
  });

export {
  verifyUserFromToken,
  deleteCollection,
  getAllUsersByType,
  deleteAllUsersInCollection,
  getUserFromToken,
  deleteUserFromToken,
  userLogin,
};
