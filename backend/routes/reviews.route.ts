import { Router } from 'express';
import controller from '../controllers/review.controller';
import validateToken from '../middlewares/validateToken';
import account from '../utils/accountTypes';
const router = Router();

router
  .route('/')
  .get(controller.getAllReviews)
  .delete([validateToken([account.MANAGER]), controller.deleteAllReviews]);

//The only way to create a review is through a completed order
router
  .route('/order/:orderId/product/:productId')
  .post([validateToken([account.BUYER]), controller.createReview]);

router.route('/product/:productId').get(controller.getReviewsByProductId);

router.route('/review/:reviewId').get(controller.getReviewById);
//   .delete(
//     validateToken([account.BUYER, account.MANAGER]),
//     controller.deleteReviewById
//   );

export default router;
