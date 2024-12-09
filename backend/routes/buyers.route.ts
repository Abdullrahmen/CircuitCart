import { Router } from 'express';
import controller from '../controllers/buyer.controller';
import validateToken from '../middlewares/validateToken';
import accountTypes from '../utils/accountTypes';
const router = Router();

router
  .route('/')
  .get([validateToken(accountTypes.ALL), controller.getAllBuyers])
  .delete([validateToken(accountTypes.ALL), controller.deleteAllBuyers]);
// router.route('/buyers/:id') -> managers

router
  .route('/u')
  .get([validateToken([accountTypes.BUYER]), controller.getBuyerFromToken])
  .delete([
    validateToken([accountTypes.BUYER]),
    controller.deleteBuyerFromToken,
  ]);

router.route('/register').post(controller.register);

router.route('/login').post(controller.login);

export default router;
