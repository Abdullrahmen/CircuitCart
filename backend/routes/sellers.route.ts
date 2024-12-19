import { Router } from 'express';
import controller from '../controllers/seller.controller';
import validateToken from '../middlewares/validateToken';
import account from '../utils/accountTypes';
const router = Router();

router
  .route('/')
  .get([validateToken([account.MANAGER]), controller.getAllSellers])
  .delete([validateToken([account.MANAGER]), controller.deleteAllSellers]);

router
  .route('/one/:sellerId')
  .get(controller.getSellerById([account.MANAGER, account.SELLER]))
  .delete([
    validateToken([account.MANAGER, account.SELLER]),
    controller.deleteSellerById,
  ]);

router
  .route('/u')
  .get([validateToken([account.SELLER]), controller.getSellerFromToken])
  .delete([validateToken([account.SELLER]), controller.deleteSellerFromToken]);

router.route('/register').post(controller.register);

router.route('/login').post(controller.login);

export default router;
