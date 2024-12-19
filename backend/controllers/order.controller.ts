import { Response, NextFunction } from 'express';
import { ITokenRequest } from '../interfaces/TokenRequest';
import asyncErrorWrapper from '../middlewares/asyncErrorWrapper';
import { verifyUserFromToken } from './user.controller';
import orderModel from '../models/order.model';
import productModel from '../models/product.model';
import mongoose from 'mongoose';
import { isInt } from 'validator';

import AppError from '../utils/appError';
import httpStat from '../utils/httpStatusText';
import statusTypes from '../utils/statusTypes';
import { buyerModel, sellerModel } from '../models/users.models';

interface IProduct {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  category_params: { name: string; ordered: any }[] | [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  other_params: { name: string; ordered: any }[] | [];
  quantity: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const validateProductOrder = (product: IProduct, full_product: any) => {
  const initial_err = `Product with id {${product.id}}`;
  if (!product.other_params || !Array.isArray(product.other_params))
    return `${initial_err} must have other_params`;
  if (!product.category_params || !Array.isArray(product.category_params))
    return `${initial_err} must have category_params`;
  if (!product.quantity || !isInt(String(product.quantity)) || product.quantity <= 0)
    return `${initial_err} must have a valid quantity`;
  if (!full_product) return `${initial_err} does not exist`;
  if (product.quantity > (full_product.stock || 0))
    return `${initial_err} is out of stock`;
  if (full_product.isPending || full_product.isHidden)
    return `${initial_err} is not available`;

  if (full_product.category_params.length !== product.category_params.length)
    return `${initial_err} must have the same number of category params`;
  if (full_product.other_params.length !== product.other_params.length)
    return `${initial_err} must have the same number of other params`;

  for (let idx = 0; idx < product.category_params.length; ++idx) {
    const product_param = product.category_params[idx];
    if (!product_param.name)
      return `${initial_err} must have category parameter names`;
    if (product_param.ordered === undefined || product_param.ordered === null)
      return `${initial_err} must have category parameter values in ${product_param.name}`;
    const full_product_param = full_product.category_params.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (p: any) => p.name === product_param.name
    );
    if (!full_product_param)
      return `${initial_err} must have the same category parameter names in ${product_param.name}`;
    if (!full_product_param.available.includes(product_param.ordered))
      return `${initial_err} must have available category parameter values in ${product_param.name}`;
  }
  for (let idx = 0; idx < product.other_params.length; ++idx) {
    const product_param = product.other_params[idx];
    if (!product_param.name) return `${initial_err} must have other param names`;
    if (!product_param.ordered)
      return `${initial_err} must have other param values in ${product_param.name}`;
    const full_product_param = full_product.other_params.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (p: any) => p.name === product_param.name
    );
    if (!full_product_param)
      return `${initial_err} must have the same other param names in ${product_param.name}`;
    if (!full_product_param.available.includes(product_param.ordered))
      return `${initial_err} must have available other param values in ${product_param.name}`;
  }

  return '';
};

const createOrder = asyncErrorWrapper(
  async (req: ITokenRequest, res: Response, next: NextFunction) => {
    const body = req.body;
    const user = await verifyUserFromToken(req);

    // Initial validation
    if (!body.products || !Array.isArray(body.products))
      return next(
        new AppError('The products field must be an array', 400, httpStat.FAIL)
      );
    for (const product of body.products) {
      if (!product.id || !mongoose.Types.ObjectId.isValid(product.id)) {
        return next(
          new AppError('All products must have a valid id', 400, httpStat.FAIL)
        );
      }
    }

    // Get all the products from the database
    const full_products = await productModel.find({
      _id: { $in: body.products.map((product: IProduct) => product.id) },
    });

    let total_price = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const validatedProducts: any[] = [];
    for (let idx = 0; idx < body.products.length; ++idx) {
      const product: IProduct = body.products[idx];
      const full_product = full_products.find(
        (p) => p._id.toString() === product.id
      );
      if (!full_product)
        return next(
          new AppError(
            `Product with id {${product.id}} doesn't exist`,
            400,
            httpStat.FAIL
          )
        );
      const err: string = validateProductOrder(product, full_product);
      if (err) return next(new AppError(err, 400, httpStat.FAIL));

      validatedProducts.push({
        id: product.id,
        seller: full_product.seller?.id,
        category_params: product.category_params,
        other_params: product.other_params,
        quantity: product.quantity,
        price: full_product.price,
        status: statusTypes.PRODUCT.PENDING,
      });
      total_price += product.quantity * full_product.price;
    }

    const order = await orderModel.create({
      buyer: user._id,
      products: validatedProducts,
      status: statusTypes.ORDER.PENDING,
      total_price: total_price,
      date: new Date(),
    });

    sellerModel.bulkWrite(
      validatedProducts.map((product) => ({
        updateOne: {
          filter: { _id: product.seller },
          update: {
            $push: {
              pendingOrders: validatedProducts.filter(
                (p) => p.seller === product.seller
              ),
            },
          },
        },
      }))
    );

    buyerModel.updateOne({ _id: user._id }, { $push: { orders: order._id } });

    res.status(201).json({
      status: httpStat.SUCCESS,
      message: 'Order created successfully, waiting for seller confirmation',
      data: order,
    });
  }
);

export default {
  createOrder,
  // getOrderById,
  // getAllOrders,
  // updateOrderStatus,
  // createReviews,
  // getOrdersFromToken,
};
