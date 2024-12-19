import { Response, NextFunction } from 'express';
import { ITokenRequest } from '../interfaces/TokenRequest';
import asyncErrorWrapper from '../middlewares/asyncErrorWrapper';
import { deleteCollection, verifyUserFromToken } from './user.controller';
import orderModel from '../models/order.model';
import productModel from '../models/product.model';
import mongoose from 'mongoose';
import { isInt } from 'validator';
import AppError from '../utils/appError';
import httpStat from '../utils/httpStatusText';
import STAT from '../utils/statusTypes';
import { buyerModel, sellerModel } from '../models/users.models';
import accountTypes from '../utils/accountTypes';
import { isUnique } from '../utils/array';

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
    if (!body.products.map((product: IProduct) => product.id).every(isUnique))
      return next(new AppError('Products must be unique', 400, httpStat.FAIL));

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
        status: STAT.PRODUCT.PENDING,
      });
      total_price += product.quantity * full_product.price;
    }

    const order = await orderModel.create({
      buyer: user._id,
      products: validatedProducts,
      total_price: total_price,
      date: new Date(),
    });
    if (!order) return next(new AppError('Order not created', 500, httpStat.FAIL));

    //TODO when there is a problem with the seller, the order should be deleted
    await sellerModel.updateMany(
      { _id: { $in: validatedProducts.map((p) => p.seller) } },
      { $push: { pendingOrders: order._id } }
    );
    await buyerModel.updateOne({ _id: user._id }, { $push: { orders: order._id } });

    res.status(201).json({
      status: httpStat.SUCCESS,
      message: 'Order created successfully, waiting for seller confirmation',
      data: order,
    });
  }
);

const getAllOrders = asyncErrorWrapper(async (req: ITokenRequest, res: Response) => {
  await verifyUserFromToken(req);
  const orders = await orderModel.find({});
  res.status(200).json({
    status: httpStat.SUCCESS,
    message: 'Orders retrieved successfully',
    data: orders,
  });
});

const deleteAllOrders = asyncErrorWrapper(
  async (req: ITokenRequest, res: Response, next: NextFunction) => {
    await verifyUserFromToken(req);
    await sellerModel.updateMany({}, { pendingOrders: [] });
    await buyerModel.updateMany({}, { orders: [] });
    if (await deleteCollection('orders'))
      return res.status(200).json({
        status: httpStat.SUCCESS,
        message: 'All orders deleted successfully and all users updated',
      });
    return next(new AppError('No orders found / deleted', 404, httpStat.FAIL));
  }
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getSellerProductsFromOrder = (seller: any, order: any) => {
  const products = order.products.filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (p: any) => p.seller.toString() === seller._id.toString()
  );
  return { _id: order._id, products };
};

const getOrderById = asyncErrorWrapper(
  async (req: ITokenRequest, res: Response, next: NextFunction) => {
    const user = await verifyUserFromToken(req);
    let select = '-__v';
    if (
      user.user.account_type === accountTypes.BUYER &&
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      !(user as any).orders.includes(req.params.orderId)
    )
      return next(
        new AppError('You are not authorized to view this order', 403, httpStat.FAIL)
      );

    if (user.user.account_type === accountTypes.SELLER) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!(user as any).pendingOrders.includes(req.params.orderId))
        return next(
          new AppError(
            'You are not authorized to view this order',
            403,
            httpStat.FAIL
          )
        );
      select = '+products +_id';
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let order: any = await orderModel
      .findById(req.params.orderId)
      .lean()
      .select(select);
    if (!order) return next(new AppError('Order not found', 404, httpStat.FAIL));
    if (user.user.account_type === accountTypes.SELLER)
      order = getSellerProductsFromOrder(user, order);

    res.status(200).json({
      status: httpStat.SUCCESS,
      message: 'Order retrieved successfully',
      data: order,
    });
  }
);

const updateProductStatus = asyncErrorWrapper(
  async (req: ITokenRequest, res: Response, next: NextFunction) => {
    const user = await verifyUserFromToken(req);
    if (!req.params.orderId || !mongoose.Types.ObjectId.isValid(req.params.orderId))
      return next(new AppError('Invalid order id', 400, httpStat.FAIL));
    if (!req.body.status)
      return next(new AppError('Status field is required', 400, httpStat.FAIL));

    const to_stat = req.body.status.toUpperCase();
    const stats = STAT.PRODUCT.ALL;
    if (!stats.includes(to_stat))
      return next(
        new AppError(
          'Invalid status \n' + 'Product statuses are: ' + stats.join(', '),
          400,
          httpStat.FAIL
        )
      );
    if (
      to_stat === STAT.PRODUCT.COMPLETED &&
      user.user.account_type === accountTypes.SELLER
    )
      return next(
        new AppError(
          'Seller cannot update the status to completed',
          403,
          httpStat.FAIL
        )
      );

    const order = await orderModel.findById(req.params.orderId);
    if (!order) return next(new AppError('Order not found', 404, httpStat.FAIL));
    const product = order.products.find(
      (p) => p.id.toString() === req.params.productId
    );
    if (!product)
      return next(
        new AppError('Product not found in this order', 404, httpStat.FAIL)
      );

    if (
      user.user.account_type === accountTypes.SELLER &&
      (product.seller.toString() !== user._id.toString() ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        !(user as any).pendingOrders.includes(req.params.orderId))
    )
      return next(
        new AppError(
          'You are not authorized to update this product',
          403,
          httpStat.FAIL
        )
      );

    if (!stats.slice(stats.indexOf(product.status) + 1).includes(to_stat))
      return next(
        new AppError(
          `Product status is already ${product.status}`,
          400,
          httpStat.FAIL
        )
      );

    product.status = to_stat;
    if (product.status === STAT.PRODUCT.AT_WAREHOUSE)
      if (order.products.every((p) => p.status === STAT.PRODUCT.AT_WAREHOUSE))
        order.status = STAT.ORDER.AT_WAREHOUSE;
    await order.save();

    res.status(200).json({
      status: httpStat.SUCCESS,
      message: 'Product status updated successfully to ' + to_stat,
    });
  }
);

const updateOrderStatus = asyncErrorWrapper(
  async (req: ITokenRequest, res: Response, next: NextFunction) => {
    await verifyUserFromToken(req);
    if (!req.params.orderId || !mongoose.Types.ObjectId.isValid(req.params.orderId))
      return next(new AppError('Invalid order id', 400, httpStat.FAIL));
    if (!req.body.status)
      return next(new AppError('Status field is required', 400, httpStat.FAIL));

    const to_stat = req.body.status.toUpperCase();
    const stats = STAT.ORDER.ALL;
    if (!stats.includes(to_stat))
      return next(
        new AppError(
          'Invalid status \n' + 'Order statuses are: ' + stats.join(', '),
          400,
          httpStat.FAIL
        )
      );
    if (
      to_stat === STAT.ORDER.AWAITING_PRODUCTS_RECEPTION ||
      to_stat === STAT.ORDER.AT_WAREHOUSE
    )
      return next(
        new AppError(
          'Cannot update order status to ' +
            to_stat +
            ' because it is automatically updated status \nOther order statuses are: ' +
            stats.join(', '),
          400,
          httpStat.FAIL
        )
      );

    const order = await orderModel.findById(req.params.orderId);
    if (!order) return next(new AppError('Order not found', 404, httpStat.FAIL));

    if (order.status === STAT.ORDER.AWAITING_PRODUCTS_RECEPTION)
      return next(
        new AppError(
          'Cannot update order status until all products are received',
          400,
          httpStat.FAIL
        )
      );
    if (!stats.slice(stats.indexOf(order.status) + 1).includes(to_stat))
      return next(
        new AppError(`Order status is already ${order.status}`, 400, httpStat.FAIL)
      );

    order.status = to_stat;
    if (order.status === STAT.ORDER.DELIVERED) {
      order.products.forEach((p) => (p.status = STAT.PRODUCT.COMPLETED));
      await sellerModel.updateMany(
        { _id: { $in: order.products.map((p) => p.seller) } },
        { $pull: { pendingOrders: order._id } }
      );
      await productModel.updateMany(
        { _id: { $in: order.products.map((p) => p.id) } },
        { $inc: { total_sales: 1 } }
      );
    }
    await order.save();

    res.status(200).json({
      status: httpStat.SUCCESS,
      message: 'Order status updated successfully to ' + to_stat,
    });
  }
);

export default {
  createOrder,
  getOrderById,
  getAllOrders,
  deleteAllOrders,
  updateProductStatus,
  updateOrderStatus,
  // getOrdersFromToken,
};
