import { managerModel } from '../models/users.models';
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

const getAllManagers = getAllUsersByType(accountTypes.MANAGER);

const deleteAllManagers = deleteAllUsersInCollection('managers');

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
    const manager = new managerModel({
      user: {
        name: body.name,
        email: body.email,
        avatar: body.avatar || null,
        account_type: accountTypes.MANAGER,
        gender: body.gender,
        age: body.age,
        last_activity: date,
        created_at: date,
        updated_at: date,
      },
      isGuaranteed: true,
    });
    manager.user.password = await bcrypt.hash(body.password, 12);

    const newManager = await manager.save();
    res.status(201).json({
      status: httpStatusText.SUCCESS,
      data: {
        _id: newManager._id,
        name: newManager.user.name,
        email: newManager.user.email,
      },
    });
  }
);

const getManagerFromToken = getUserFromToken(accountTypes.MANAGER);

const deleteManagerFromToken = deleteUserFromToken(accountTypes.MANAGER);

const login = userLogin(accountTypes.MANAGER);

export default {
  getAllManagers,
  register,
  getManagerFromToken,
  login,
  deleteAllManagers,
  deleteManagerFromToken,
};
