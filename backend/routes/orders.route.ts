import { Router } from 'express';
import controller from '../controllers/order.controller';
import validateToken from '../middlewares/validateToken';
import account from '../utils/accountTypes';
const router = Router();

router
  .route('/')
  //   .get([validateToken([account.MANAGER]), controller.getAllOrders])
  .post([validateToken([account.BUYER]), controller.createOrder]);

// router.route('/:orderId').get(controller.getOrderById);

// router.route('/:orderId/status').patch(controller.updateOrderStatus);

//The only way to create a review is through an order
// router.route('/:orderId/reviews').post(controller.createReviews);

// router
//   .route('/u')
//   .get([validateToken([account.BUYER]), controller.getOrdersFromToken]);

export default router;
