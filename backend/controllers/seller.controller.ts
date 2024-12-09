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
} from './user.controller';

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

export default {
  getAllSellers,
  register,
  getSellerFromToken,
  login,
  deleteAllSellers,
  deleteSellerFromToken,
};
