import { Request, Response, NextFunction } from 'express';
import { categoryModel } from '../models/category.model';
import { ITokenRequest } from '../interfaces/TokenRequest';
import appError from '../utils/appError';
import asyncErrorWrapper from '../middlewares/asyncErrorWrapper';
import { verifyUserFromToken, deleteCollection } from './user.controller';
import httpStatusText from '../utils/httpStatusText';

const getAllCategories = asyncErrorWrapper(
  async (req: Request, res: Response) => {
    const categories = await categoryModel.find({});
    res.status(200).json({ status: httpStatusText.SUCCESS, data: categories });
  }
);

const deleteAllCategories = asyncErrorWrapper(
  async (req: ITokenRequest, res: Response) => {
    await verifyUserFromToken(req);
    await deleteCollection('categories');
    res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: { message: 'All categories deleted successfully' },
    });
  }
);

const addCategory = asyncErrorWrapper(
  async (req: ITokenRequest, res: Response, next: NextFunction) => {
    await verifyUserFromToken(req);
    const categoryData = req.body;
    //Validation
    if (categoryData.name.length < 3) {
      const err = new appError(
        'Name must be more than 2 characters.',
        400,
        httpStatusText.FAIL
      );
      return next(err);
    }

    const category = new categoryModel({
      name: categoryData.name,
      main_params: categoryData.main_params || null,
    });
    const newCategory = await category.save();

    res.status(201).json({
      status: httpStatusText.SUCCESS,
      data: newCategory,
    });
  }
);

const getCategory = asyncErrorWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const category = await categoryModel.findOne({ name: req.params.name });
    if (!category) {
      const err = new appError('Category not found', 404, httpStatusText.FAIL);
      return next(err);
    }
    res.status(200).json({ status: httpStatusText.SUCCESS, data: category });
  }
);

const deleteCategory = asyncErrorWrapper(
  async (req: ITokenRequest, res: Response, next: NextFunction) => {
    await verifyUserFromToken(req);
    const category = await categoryModel.findOneAndDelete({
      name: req.params.name,
    });
    if (!category) {
      const err = new appError('Category not found', 404, httpStatusText.FAIL);
      return next(err);
    }
    res.status(200).json({ status: httpStatusText.SUCCESS, data: category });
  }
);

export default {
  addCategory,
  deleteAllCategories,
  deleteCategory,
  getAllCategories,
  getCategory,
};
