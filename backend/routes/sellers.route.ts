import { Router } from 'express';
import controller from '../controllers/seller.controller';
import validateToken from '../middlewares/validateToken';
import accountTypes from '../utils/accountTypes';
const router = Router();

router
  .route('/')
  .get([validateToken(accountTypes.ALL), controller.getAllSellers])
  .delete([validateToken(accountTypes.ALL), controller.deleteAllSellers]);
// router.route('/sellers/:id') -> managers

router
  .route('/u')
  .get([validateToken([accountTypes.SELLER]), controller.getSellerFromToken])
  .delete([
    validateToken([accountTypes.SELLER]),
    controller.deleteSellerFromToken,
  ]);

router.route('/register').post(controller.register);

router.route('/login').post(controller.login);

export default router;
