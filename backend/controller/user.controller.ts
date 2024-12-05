import httpStatusText from '../utils/httpStatusText';
import accountTypes from '../utils/accountTypes';
import { IUserModel } from '../interfaces/UserModel';
import { Request, Response, NextFunction } from 'express';
import { generateToken, validateUser } from '../utils/loginUtils';
import AsyncError from '../middlewares/asyncErrorWrapper';
import appError from '../utils/appError';

const getAllUsers = (userModel: IUserModel) =>
  AsyncError(async (req: Request, res: Response) => {
    const sellers = await userModel.find({});
    res.json({ status: httpStatusText.SUCCESS, data: { sellers } });
  });

const userLogin = (account_type: string, userModel: IUserModel) =>
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

    const user = validateUser(body.email, body.password, userModel);
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

export { getAllUsers, userLogin };
