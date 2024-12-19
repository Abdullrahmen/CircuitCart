import { Router } from 'express';
import controller from '../controllers/review.controller';
import validateToken from '../middlewares/validateToken';
import account from '../utils/accountTypes';
const router = Router();

router
  .route('/')
  .get(controller.getAllReviews)
  .delete([validateToken([account.MANAGER]), controller.deleteAllReviews]);

router
  .route('/:reviewId')
  .get(controller.getReviewById)
  .delete(
    validateToken([account.BUYER, account.MANAGER]),
    controller.deleteReviewById
  );

export default router;
