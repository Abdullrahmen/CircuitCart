import { Router } from 'express';
import controller from '../controller/seller.controller';
import validateToken from '../middlewares/validateToken';
import accountTypes from '../utils/accountTypes';
const router = Router();

router
  .route('/')
  .get([validateToken(accountTypes.ALL), controller.getAllSellers]);

router.route('/u').get([validateToken(accountTypes.ALL), controller.getSeller]);

router.route('/register').post(controller.register);

router.route('/login').post(controller.login);

export default router;
