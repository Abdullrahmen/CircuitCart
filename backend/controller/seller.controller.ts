import sellerModel from '../models/seller.model';
import httpStatusText from '../utils/httpStatusText';
import { Request, Response, NextFunction } from 'express';
import { ITokenRequest } from '../interfaces/TokenRequest';
import AsyncError from '../middlewares/asyncErrorWrapper';
import appError from '../utils/appError';
import accountTypes from '../utils/accountTypes';
import bcrypt from 'bcrypt';
import { getAllUsers, userLogin } from './user.controller';
import { IUserModel } from '../interfaces/UserModel';
import { JwtPayload } from 'jsonwebtoken';

const getAllSellers = getAllUsers(sellerModel as unknown as IUserModel);

const register = AsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body;
    console.log(body);
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

const getSeller = AsyncError(
  async (req: ITokenRequest, res: Response, next: NextFunction) => {
    const jwt_data = req.jwt_data as JwtPayload;
    const user = await sellerModel.findOne({ 'user.email': jwt_data.email });
    if (!user) {
      const err = new appError('Seller not found', 404, httpStatusText.FAIL);
      return next(err);
    }
    res.json({ status: httpStatusText.SUCCESS, data: { user } });
  }
);

const login = userLogin(
  accountTypes.SELLER,
  sellerModel as unknown as IUserModel
);

export default { getAllSellers, register, getSeller, login };
