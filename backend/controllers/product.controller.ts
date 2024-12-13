import asyncErrorWrapper from '../middlewares/asyncErrorWrapper';
import { Response, NextFunction } from 'express';
import productModel from '../models/product.model';
import { categoryModel } from '../models/category.model';
import AppError from '../utils/appError';
import httpStatusText from '../utils/httpStatusText';
import { ITokenRequest } from '../interfaces/TokenRequest';
import { deleteCollection, verifyUserFromToken } from './user.controller';
import mongoose from 'mongoose';
import accountTypes from '../utils/accountTypes';
import { sellerModel } from '../models/users.models';
import { removeItem } from '../utils/array';
import { validateTokenFunction } from '../middlewares/validateToken';

const buildQuery = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filters: any,
  withHidden: boolean,
  withPending: boolean
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = {};

  if (filters.name) query.name = new RegExp(filters.name, 'i');
  if (filters.seller) query.seller = { name: filters.seller };
  if (filters.category) query.category = filters.category;
  if (filters.minPrice) query.price = { $gte: filters.minPrice };
  if (filters.maxPrice)
    query.price = { ...query.price, $lte: filters.maxPrice };
  if (filters.description)
    query.description = new RegExp(filters.description, 'i');
  if (filters.minRating) query.rating = { $gte: filters.minRating };
  if (!withHidden) query.isHidden = false;
  if (!withPending) query.isPending = false;
  if (filters.main_params) query.main_params = filters.main_params;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const options: any = {};
  if (filters.limit) options.limit = parseInt(filters.limit);
  if (filters.skip) options.skip = parseInt(filters.skip);
  if (filters.sort) options.sort = filters.sort;
  return { query, options };
};

const getSelectedProducts = (withHidden = false, withPending = false) =>
  asyncErrorWrapper(async (req: ITokenRequest, res: Response) => {
    let exclude = '-__v -isPending -isHidden';
    if (withHidden || withPending) {
      await verifyUserFromToken(req);
      exclude = '-__v';
    }
    const filters = req.query;
    const query = buildQuery(filters, withHidden, withPending);
    const products = await productModel
      .find(query.query)
      .setOptions(query.options)
      .select(exclude)
      .lean(true);
    res.json({
      status: httpStatusText.SUCCESS,
      data: products,
    });
  });

const deleteSelectedProducts = (withHidden = false, withPending = false) =>
  asyncErrorWrapper(async (req: ITokenRequest, res: Response) => {
    await verifyUserFromToken(req);
    const filters = req.query;
    const query = buildQuery(filters, withHidden, withPending);
    const products = await productModel
      .find(query.query)
      .setOptions(query.options)
      .populate('seller.id');
    let n_delete = products.length;
    for (const product of products) {
      if (!product || !product.seller || !product.seller.id) {
        n_delete -= 1;
        continue;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const seller: any = product.seller.id;
      removeItem(seller.products, product._id);
      await seller.save();
      await product.deleteOne();
    }
    res.json({
      status: httpStatusText.SUCCESS,
      data: { message: `${n_delete} products deleted` },
    });
  });

const deleteAllProducts = asyncErrorWrapper(
  async (req: ITokenRequest, res: Response) => {
    await verifyUserFromToken(req);
    await deleteCollection('products');
    await sellerModel.updateMany({}, { $set: { products: [] } });
    res.json({
      status: httpStatusText.SUCCESS,
      data: { message: 'All products deleted, deleted from sellers' },
    });
  }
);

const addProducts = asyncErrorWrapper(
  async (req: ITokenRequest, res: Response, next: NextFunction) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = (await verifyUserFromToken(req)) as any;
    const products = [];

    for await (const productData of req.body) {
      if (!productData)
        return next(
          new AppError('No product data provided', 400, httpStatusText.FAIL)
        );
      //Validation
      if (!productData.name || !productData.category || !productData.price) {
        return next(
          new AppError(
            'Name, category and price are required fields.',
            400,
            httpStatusText.FAIL
          )
        );
      }
      if (productData.name.length < 3) {
        const err = new AppError(
          'Name must be more than 2 characters.',
          400,
          httpStatusText.FAIL
        );
        return next(err);
      }

      const category = await categoryModel
        .findOne({ name: productData.category })
        .lean();

      if (!category) {
        const err = new AppError(
          'Category not found',
          404,
          httpStatusText.FAIL
        );
        return next(err);
      }
      const random = Math.floor(Math.random() * 2);
      products.push({
        name: productData.name,
        seller: { name: user.user.name?.first, id: user._id },
        category: category.name,
        price: productData.price,
        description: productData.description,
        // product_imgs: productData.product_imgs,
        reviews: [],
        main_params: productData.main_params || [],
        rating: productData.rating,
        isPending:
          productData.isPending === undefined ? random : productData.isPending,
        isHidden:
          productData.isHidden === undefined ? random : productData.isPending,
        total_sales: 0,
      });
    }

    const newProducts = await productModel.insertMany(products, {
      ordered: false,
      rawResult: true,
    });

    const userProducts = user.products.concat(
      Object.values(newProducts.insertedIds).map((id) => id.toString())
    );
    await user.updateOne({ products: userProducts });

    res.status(201).json({
      status: httpStatusText.SUCCESS,
      data: {
        insertedIds: Object.values(newProducts.insertedIds),
        insertedCount: newProducts.insertedCount,
        message: 'Products added successfully and added to seller products',
      },
    });
  }
);

const getProduct = (get_hidden_account_types: string[] = []) =>
  asyncErrorWrapper(
    async (req: ITokenRequest, res: Response, next: NextFunction) => {
      if (!mongoose.Types.ObjectId.isValid(req.params.productId))
        return next(
          new AppError('Invalid product ID format', 400, httpStatusText.FAIL)
        );
      const product = await productModel
        .findById(req.params.productId)
        .select('-__v')
        .lean();
      if (!product)
        return next(
          new AppError('Product not found', 404, httpStatusText.FAIL)
        );
      if (product.isHidden || product.isPending) {
        await validateTokenFunction(get_hidden_account_types)(req, res, next);
        const user = await verifyUserFromToken(req);
        if (
          req.jwt_data?.account_type === accountTypes.SELLER &&
          user._id.toString() !== product.seller?.id.toString()
        )
          return next(
            new AppError(
              'Unauthorized, not your product!!',
              403,
              httpStatusText.FAIL
            )
          );
      }

      res.status(200).json({ status: httpStatusText.SUCCESS, data: product });
    }
  );

const deleteProduct = asyncErrorWrapper(
  async (req: ITokenRequest, res: Response, next: NextFunction) => {
    const user = await verifyUserFromToken(req);
    if (!mongoose.Types.ObjectId.isValid(req.params.productId)) {
      return next(
        new AppError('Invalid product ID format', 400, httpStatusText.FAIL)
      );
    }
    const product = await productModel
      .findById(req.params.productId)
      .populate('seller.id');

    if (!product || !product.seller || !product.seller.id)
      throw new AppError('Product not found', 404, httpStatusText.FAIL);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const seller: any = product.seller.id;
    if (
      req.jwt_data?.account_type === accountTypes.SELLER &&
      user._id.toString() !== seller.id.toString()
    )
      return next(
        new AppError(
          'Unauthorized, Not your product!',
          403,
          httpStatusText.FAIL
        )
      );
    removeItem(seller.products, product._id);
    await seller.save();
    await product.deleteOne();

    res.status(200).json({ status: httpStatusText.SUCCESS, data: product });
  }
);

export default {
  getSelectedProducts,
  addProducts,
  deleteSelectedProducts,
  getProduct,
  deleteProduct,
  deleteAllProducts,
};
