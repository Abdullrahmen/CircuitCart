import { Request, Response, NextFunction } from 'express';
import { ITokenRequest } from '../interfaces/TokenRequest';
import asyncErrorWrapper from '../middlewares/asyncErrorWrapper';
import orderModel from '../models/order.model';
import productModel from '../models/product.model';
import { isInt } from 'validator';
import AppError from '../utils/appError';
import httpStat from '../utils/httpStatusText';
import { reviewModel } from '../models/review.model';
import { deleteCollection, verifyUserFromToken } from './user.controller';

const createReview = asyncErrorWrapper(
  async (req: ITokenRequest, res: Response, next: NextFunction) => {
    const buyer = await verifyUserFromToken(req);
    const { orderId, productId } = req.params;
    const body = req.body;

    if (!body.rating)
      return next(
        new AppError('Missing required fields (rating)', 400, httpStat.FAIL)
      );
    if (!isInt(body.rating.toString(), { min: 0, max: 5 }))
      return next(
        new AppError('Rating must be between 0 and 5', 400, httpStat.FAIL)
      );

    const order = await orderModel.findById(orderId);
    if (!order) return next(new AppError('Order not found', 404, httpStat.FAIL));
    if (order.buyer.toString() !== buyer._id.toString())
      return next(new AppError('Unauthorized', 403, httpStat.FAIL));

    const full_product = await productModel.findById(productId);
    const product = order.products.find((p) => p.id.toString() === productId);
    if (!full_product || !product)
      return next(new AppError('Product not found', 404, httpStat.FAIL));
    if (product.review)
      return next(new AppError('Product already reviewed', 400, httpStat.FAIL));

    const reviewData = {
      buyer: buyer._id,
      product: productId,
      title: body.title,
      review: body.reviews,
      rating: body.rating,
      quantity: product.quantity,
    };
    const review = await reviewModel.create(reviewData);
    if (!review)
      return next(new AppError('Review not created', 500, httpStat.ERROR));
    full_product.reviews.push(review._id);
    full_product.rating =
      ((full_product.rating || 0) * full_product.reviews.length + review.rating) /
      (full_product.reviews.length + 1);
    product.review = review._id;
    await full_product.save();
    await order.save();
    res.status(201).json({
      status: httpStat.SUCCESS,
      data: review,
    });
  }
);

const getAllReviews = asyncErrorWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const reviews = await reviewModel.find();
    if (!reviews) return next(new AppError('No reviews found', 404, httpStat.FAIL));
    res.status(200).json({
      status: httpStat.SUCCESS,
      data: reviews,
    });
  }
);

const deleteAllReviews = asyncErrorWrapper(
  async (req: ITokenRequest, res: Response, next: NextFunction) => {
    await verifyUserFromToken(req);
    const result = await deleteCollection('reviews');
    await productModel.updateMany({}, { reviews: [] });
    await orderModel.updateMany({}, { $set: { 'products.$[].review': null } });
    if (!result) return next(new AppError('No reviews found', 404, httpStat.FAIL));
    res.status(200).json({
      status: httpStat.SUCCESS,
      message:
        'All reviews deleted successfully and removed from products and orders',
    });
  }
);

const getReviewsByProductId = asyncErrorWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.params;
    const reviews = await reviewModel
      .find({ product: productId })
      .select('-__v')
      .lean();
    if (!reviews) return next(new AppError('No reviews found', 404, httpStat.FAIL));
    res.status(200).json({
      status: httpStat.SUCCESS,
      data: reviews,
    });
  }
);

const getReviewById = asyncErrorWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { reviewId } = req.params;
    const review = await reviewModel.findById(reviewId).select('-__v').lean();
    if (!review) return next(new AppError('Review not found', 404, httpStat.FAIL));
    res.status(200).json({
      status: httpStat.SUCCESS,
      data: review,
    });
  }
);

export default {
  createReview,
  deleteAllReviews,
  getAllReviews,
  getReviewsByProductId,
  getReviewById,
  // deleteReviewById,
};
