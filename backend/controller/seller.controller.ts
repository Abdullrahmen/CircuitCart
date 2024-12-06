import { sellerModel } from '../models/seller.model';
import httpStatusText from '../utils/httpStatusText';
import { Request, Response, NextFunction } from 'express';
import { ITokenRequest } from '../interfaces/TokenRequest';
import AsyncError from '../middlewares/asyncErrorWrapper';
import appError from '../utils/appError';
import accountTypes from '../utils/accountTypes';
import bcrypt from 'bcrypt';
import {
  userLogin,
  deleteCollection,
  deleteThis,
  getThis,
} from './user.controller';
import { JwtPayload } from 'jsonwebtoken';
import mongoose from 'mongoose';
import { IUserModel } from '../interfaces/UserModel';

const checkUserFromToken = async (req: ITokenRequest) => {
  const jwt_data = req.jwt_data as JwtPayload;
  // Get user model from account type
  const userModel = mongoose.model(
    ...accountTypes.ModelArgs[
      jwt_data.account_type as keyof typeof accountTypes.ModelArgs
    ]
  );
  if (!userModel) {
    const err = new appError('Model not found', 500, httpStatusText.ERROR);
    throw err;
  }
  const user = await userModel.findOne({ 'user.email': jwt_data.email });
  if (!user) {
    const err = new appError('User not found', 404, httpStatusText.FAIL);
    throw err;
  }
  return user;
};

const getAllSellers = AsyncError(async (req: ITokenRequest, res: Response) => {
  await checkUserFromToken(req);

  // Get user model from account type
  const userModel = mongoose.model(
    ...accountTypes.ModelArgs[
      (req.jwt_data as JwtPayload)
        .account_type as keyof typeof accountTypes.ModelArgs
    ]
  );
  const sellers = await (userModel as unknown as IUserModel).find({});
  res.json({ status: httpStatusText.SUCCESS, data: { sellers } });
});

const deleteAllSellers = AsyncError(
  async (req: ITokenRequest, res: Response, next: NextFunction) => {
    await checkUserFromToken(req);
    const result = await deleteCollection('sellers');
    if (!result) {
      const err = new appError('No sellers found', 404, httpStatusText.FAIL);
      return next(err);
    }
    res.json({
      status: httpStatusText.SUCCESS,
      data: { message: 'All sellers deleted' },
    });
  }
);

const register = AsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body;
    //Validation
    if (body.password.length < 3) {
      const err = new appError(
        'Password must be more than 2 characters.',
        400,
        httpStatusText.FAIL
      );
      return next(err);
    }

    const date = new Date();
    const seller = new sellerModel({
      user: {
        name: body.name,
        email: body.email,
        avatar: body.avatar || null,
        account_type: accountTypes.SELLER,
        gender: body.gender,
        age: body.age,
        last_activity: date,
        created_at: date,
        updated_at: date,
      },
      isGuaranteed: true,
    });
    seller.user.password = await bcrypt.hash(body.password, 10);

    const newSeller = await seller.save();
    res.json({
      status: httpStatusText.SUCCESS,
      data: {
        _id: newSeller._id,
      },
    });
  }
);

const getThisSeller = getThis(accountTypes.SELLER);

const deleteThisSeller = deleteThis(accountTypes.SELLER);

const login = userLogin(accountTypes.SELLER);

export default {
  getAllSellers,
  register,
  getThisSeller,
  login,
  deleteAllSellers,
  deleteThisSeller,
};
