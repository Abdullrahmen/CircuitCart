import { Router } from 'express';
import controller from '../controllers/order.controller';
import validateToken from '../middlewares/validateToken';
import account from '../utils/accountTypes';
const router = Router();

router
  .route('/')
  .get([validateToken([account.MANAGER]), controller.getAllOrders])
  .delete([validateToken([account.MANAGER]), controller.deleteAllOrders])
  .post([validateToken([account.BUYER]), controller.createOrder]);

router.route('/:orderId').get(validateToken(account.ALL), controller.getOrderById);

router
  .route('/:orderId/status')
  .patch([validateToken([account.MANAGER]), controller.updateOrderStatus]);
router
  .route('/:orderId/product/:productId/status')
  .patch([
    validateToken([account.SELLER, account.MANAGER]),
    controller.updateProductStatus,
  ]);

// router
//   .route('/u')
//   .get([validateToken([account.BUYER]), controller.getOrdersFromToken]);

export default router;
