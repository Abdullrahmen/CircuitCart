import { Router } from 'express';
import controller from '../controllers/manager.controller';
import validateToken from '../middlewares/validateToken';
import account from '../utils/accountTypes';
const router = Router();

router
  .route('/')
  .get([validateToken([account.MANAGER]), controller.getAllManagers])
  .delete([validateToken([account.MANAGER]), controller.deleteAllManagers]);

// router.route('/managers/:id')

router
  .route('/u')
  .get([validateToken([account.MANAGER]), controller.getManagerFromToken])
  .delete([
    validateToken([account.MANAGER]),
    controller.deleteManagerFromToken,
  ]);

router.route('/register').post(controller.register);

router.route('/login').post(controller.login);

export default router;
