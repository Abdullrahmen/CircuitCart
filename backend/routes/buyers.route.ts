import { Router } from 'express';
import controller from '../controllers/buyer.controller';
import validateToken from '../middlewares/validateToken';
import account from '../utils/accountTypes';
const router = Router();

router
  .route('/')
  .get([validateToken([account.MANAGER]), controller.getAllBuyers])
  .delete([validateToken([account.MANAGER]), controller.deleteAllBuyers]);
// router.route('/buyers/:id') -> managers

router
  .route('/u')
  .get([validateToken([account.BUYER]), controller.getBuyerFromToken])
  .delete([validateToken([account.BUYER]), controller.deleteBuyerFromToken]);

router.route('/register').post(controller.register);

router.route('/login').post(controller.login);

export default router;
