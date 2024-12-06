import { Router } from 'express';
import controller from '../controller/seller.controller';
import validateToken from '../middlewares/validateToken';
import accountTypes from '../utils/accountTypes';
const router = Router();

router
  .route('/')
  .get([validateToken(accountTypes.ALL), controller.getAllSellers])
  .delete([validateToken(accountTypes.ALL), controller.deleteAllSellers]);
// router.route('/sellers/:id') -> managers

// sellers/u
router
  .route('/u')
  .get([validateToken([accountTypes.SELLER]), controller.getThisSeller])
  .delete([validateToken([accountTypes.SELLER]), controller.deleteThisSeller]);

router.route('/register').post(controller.register);

router.route('/login').post(controller.login);

export default router;
