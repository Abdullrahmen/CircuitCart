import { buyerModel } from '../models/users.models';
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

const getAllBuyers = getAllUsersByType(accountTypes.BUYER);

const deleteAllBuyers = deleteAllUsersInCollection('buyers');

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
    const buyer = new buyerModel({
      user: {
        name: body.name,
        email: body.email,
        avatar: body.avatar || null,
        account_type: accountTypes.BUYER,
        gender: body.gender,
        age: body.age,
        last_activity: date,
        created_at: date,
        updated_at: date,
      },
      isGuaranteed: true,
    });
    buyer.user.password = await bcrypt.hash(body.password, 12);

    const newBuyer = await buyer.save();
    res.status(201).json({
      status: httpStatusText.SUCCESS,
      data: {
        _id: newBuyer._id,
        name: newBuyer.user.name,
        email: newBuyer.user.email,
      },
    });
  }
);

const getBuyerFromToken = getUserFromToken(accountTypes.BUYER);

const deleteBuyerFromToken = deleteUserFromToken(accountTypes.BUYER);

const login = userLogin(accountTypes.BUYER);

export default {
  getAllBuyers,
  register,
  getBuyerFromToken,
  login,
  deleteAllBuyers,
  deleteBuyerFromToken,
};
