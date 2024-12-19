import asyncErrorWrapper from '../middlewares/asyncErrorWrapper';
import { Response, NextFunction } from 'express';
import productModel from '../models/product.model';
import { categoryModel } from '../models/category.model';
import AppError from '../utils/appError';
import httpStatusText from '../utils/httpStatusText';
import { ITokenRequest } from '../interfaces/TokenRequest';
import { deleteCollection, verifyUserFromToken } from './user.controller';
import mongoose from 'mongoose';
import account from '../utils/accountTypes';
import { sellerModel } from '../models/users.models';
import { removeItem } from '../utils/array';
import { validateTokenFunction } from '../middlewares/validateToken';
import { check_content_type } from '../utils/paramsTypes';

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
  if (filters.maxPrice) query.price = { ...query.price, $lte: filters.maxPrice };
  if (filters.description) query.description = new RegExp(filters.description, 'i');
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
      //   .populate('reviews')
      .select(exclude)
      .lean(true);
    res.json({
      status: httpStatusText.SUCCESS,
      data: products,
    });
  });

const getProductsByIds = asyncErrorWrapper(
  async (req: ITokenRequest, res: Response) => {
    const ids = req.body.ids;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new AppError('Invalid ids', 400, httpStatusText.FAIL);
    }

    const token_header = process.env.TOKEN_HEADER_KEY || '';
    const token = String(req.headers[token_header] || '');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let user: any = null;
    if (token) {
      await validateTokenFunction([account.SELLER, account.MANAGER])(req);
      user = await verifyUserFromToken(req);
    }

    const products = await productModel
      .find({ _id: { $in: ids } })
      //   .populate('reviews')
      .select('-__v')
      .lean();

    // Seller or Manager
    if (user)
      if (user.user.account_type === account.MANAGER)
        return res.json({
          status: httpStatusText.SUCCESS,
          data: products,
        });
      else if (user.user.account_type === account.SELLER) {
        const user_products = user.products.map((id: string) => id.toString());
        const allowed_products = products.filter(
          (product) =>
            (!product.isHidden && !product.isPending) ||
            user_products.includes(product._id.toString())
        );
        return res.json({
          status: httpStatusText.SUCCESS,
          data: allowed_products,
        });
      }

    //Guest user
    const allowed_products = products.filter(
      (product) => !product.isHidden && !product.isPending
    );
    res.json({
      status: httpStatusText.SUCCESS,
      data: allowed_products,
    });
  }
);

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

interface Category {
  name: string;
  parameters: { name: string; type: string }[];
}

const validateProductData = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  productData: any,
  category: Category | null,
  idx: number
) => {
  if (!category) return 'Category not found for product index ' + idx;

  if (!productData) return 'Empty product data for index ' + idx;

  if (!productData.name || !productData.category || !productData.price)
    return 'Name, category and price are required fields for product index ' + idx;

  if (productData.name.length < 3)
    return 'Name must be more than 2 characters for product index ' + idx;

  if (
    !productData.category_params ||
    productData.category_params.length != category.parameters.length
  )
    return (
      'Length of category_params !== Length category parameters in product index ' +
      idx
    );
  for (const param of productData.category_params) {
    const categoryParam = category.parameters.find((p) => p.name === param.name);
    if (
      !categoryParam ||
      !Array.isArray(param.available) ||
      !check_content_type(param.available, categoryParam.type)
    )
      return `Invalid parameter {${param.name}} for product index ` + idx;
  }
  return '';
};

const addProducts = asyncErrorWrapper(async (req: ITokenRequest, res: Response) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = (await verifyUserFromToken(req)) as any;
  const products = [];
  const errors = [];
  for await (const [i, productData] of req.body.entries()) {
    const category = await categoryModel
      .findOne({ name: productData.category })
      .lean();
    const err = validateProductData(productData, category, i);
    if (err) {
      errors.push(err);
      continue;
    }
    const random = Math.floor(Math.random() * 2);
    products.push({
      name: productData.name,
      seller: { name: user.user.name?.first, id: user._id },
      category: category?.name,
      price: productData.price,
      description: productData.description,
      // product_imgs: productData.product_imgs,
      category_params: productData.category_params,
      other_params: productData.other_params,
      isPending:
        productData.isPending === undefined ? random : productData.isPending,
      isHidden: productData.isHidden === undefined ? random : productData.isPending,
      total_sales: 0,
      stock: productData.stock || 1000,
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

  if (!newProducts.insertedCount)
    return res.status(400).json({
      status: httpStatusText.FAIL,
      data: {
        message: 'No products added',
        validationErrors: newProducts.mongoose.validationErrors,
        errors: errors,
      },
    });
  res.status(201).json({
    status: httpStatusText.SUCCESS,
    data: {
      insertedIds: Object.values(newProducts.insertedIds),
      insertedCount: newProducts.insertedCount,
      message: 'Products added successfully and added to seller products',
      validationErrors: newProducts.mongoose.validationErrors,
      errors: errors,
    },
  });
});

const getProduct = (hidden_for_account_types: string[] = []) =>
  asyncErrorWrapper(
    async (req: ITokenRequest, res: Response, next: NextFunction) => {
      if (!mongoose.Types.ObjectId.isValid(req.params.productId))
        return next(
          new AppError('Invalid product ID format', 400, httpStatusText.FAIL)
        );
      const product = await productModel
        .findById(req.params.productId)
        .select('-__v')
        // .populate('reviews')
        .lean();
      if (!product)
        return next(new AppError('Product not found', 404, httpStatusText.FAIL));
      if (product.isHidden || product.isPending) {
        await validateTokenFunction(hidden_for_account_types)(req);
        const user = await verifyUserFromToken(req);
        if (
          req.jwt_data?.account_type === account.SELLER &&
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
      req.jwt_data?.account_type === account.SELLER &&
      user._id.toString() !== seller.id.toString()
    )
      return next(
        new AppError('Unauthorized, Not your product!', 403, httpStatusText.FAIL)
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
  getProductsByIds,
  deleteProduct,
  deleteAllProducts,
};
