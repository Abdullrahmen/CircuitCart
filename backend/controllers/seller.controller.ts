import { sellerModel } from '../models/users.models';
import httpStatusText from '../utils/httpStatusText';
import { Request, Response, NextFunction } from 'express';
import AsyncError from '../middlewares/asyncErrorWrapper';
import AppError from '../utils/appError';
import accountTypes from '../utils/accountTypes';
import bcrypt from 'bcrypt';
import {
  userLogin,
  deleteUserFromToken,
  getUserFromToken,
  getAllUsersByType,
  deleteAllUsersInCollection,
  verifyUserFromToken,
} from './user.controller';
import { ITokenRequest } from '../interfaces/TokenRequest';
import mongoose from 'mongoose';
import { validateTokenFunction } from '../middlewares/validateToken';

const getAllSellers = getAllUsersByType(accountTypes.SELLER);

const deleteAllSellers = deleteAllUsersInCollection('sellers');

const register = AsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body;
    // Validation
    if (!body.password || body.password.length < 3) {
      const err = new AppError(
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
      pendingOrders: [],
    });
    seller.user.password = await bcrypt.hash(body.password, 12);

    const newSeller = await seller.save();
    res.status(201).json({
      status: httpStatusText.SUCCESS,
      data: {
        _id: newSeller._id,
        name: newSeller.user.name,
        email: newSeller.user.email,
      },
    });
  }
);

const getSellerFromToken = getUserFromToken(accountTypes.SELLER);

const deleteSellerFromToken = deleteUserFromToken(accountTypes.SELLER);

const login = userLogin(accountTypes.SELLER);

const getSellerById = (all_data_for_types: string[]) =>
  AsyncError(async (req: ITokenRequest, res: Response, next: NextFunction) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.sellerId))
      return next(
        new AppError('Invalid product ID format', 400, httpStatusText.FAIL)
      );

    let select = '-__v';

    //Check if the request is from a seller or manager or guest
    const token_header = process.env.TOKEN_HEADER_KEY || '';
    const token = String(req.headers[token_header] || '');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let user: any = null;
    if (token) {
      await validateTokenFunction(all_data_for_types)(req);
      user = await verifyUserFromToken(req);
      if (user.user.account_type === accountTypes.SELLER) {
        select = '-__v';
      }
    } else {
      //Guest user
      select =
        '-__v -user.password -pendings -user.gender -user.age\
		-user.last_activity -user.account_type -user.updated_at -pendingOrders';
    }

    const seller = await sellerModel
      .findById(req.params.sellerId)
      .select(select)
      .lean();
    if (!seller) {
      return next(
        new AppError('No seller found with that ID.', 404, httpStatusText.FAIL)
      );
    }
    if (user && user.user.account_type === accountTypes.SELLER)
      if (user._id.toString() !== seller._id.toString()) {
        return next(
          new AppError('Unauthorized, not your account.', 403, httpStatusText.FAIL)
        );
      }
    res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: seller,
    });
  });

const deleteSellerById = AsyncError(
  async (req: ITokenRequest, res: Response, next: NextFunction) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.sellerId))
      return next(
        new AppError('Invalid product ID format', 400, httpStatusText.FAIL)
      );

    const user = await verifyUserFromToken(req);
    const seller = await sellerModel.findById(req.params.sellerId).select('-__v');
    if (!seller) {
      return next(
        new AppError('No seller found with that ID.', 404, httpStatusText.FAIL)
      );
    }
    if (user.user.account_type === accountTypes.SELLER)
      if (user._id.toString() !== seller._id.toString()) {
        return next(
          new AppError('Unauthorized, not your account.', 403, httpStatusText.FAIL)
        );
      }
    const result = await seller.deleteOne();
    res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: result,
    });
  }
);

export default {
  getAllSellers,
  register,
  getSellerFromToken,
  getSellerById,
  deleteSellerById,
  login,
  deleteAllSellers,
  deleteSellerFromToken,
};
