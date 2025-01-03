import httpStatusText from '../utils/httpStatusText';
import appError from '../utils/appError';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import accountTypes from './accountTypes';
import mongoose from 'mongoose';
dotenv.config();

const generateToken = async (
  email: string,
  password: string,
  account_type: string,
  expiresIn: string
) => {
  const secret = process.env.JWT_SECRET || '';
  if (!secret) {
    const err = new appError(
      'JWT secret key is not provided',
      500,
      httpStatusText.ERROR
    );
    throw err;
  }
  const data = { email, password, account_type };
  const token = await jwt.sign(data, secret, {
    expiresIn: expiresIn,
  });
  return token;
};

const validateUser = async (
  email: string,
  password: string,
  account_type: string
) => {
  const args =
    accountTypes.ModelArgs[account_type as keyof typeof accountTypes.ModelArgs];
  const userModel = mongoose.model(args[0], args[1]);
  const user = await userModel
    .findOne({
      'user.email': email,
    })
    .lean();
  if (!user) {
    return null;
  }

  const passwordCorrect = await bcrypt.compare(password, user.user.password);
  if (!passwordCorrect) {
    return null;
  }
  return user;
};

export { generateToken, validateUser };
