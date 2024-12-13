import { Router } from 'express';
import controller from '../controllers/manager.controller';
import validateToken from '../middlewares/validateToken';
import accountTypes from '../utils/accountTypes';
const router = Router();

router
  .route('/')
  .get([validateToken([accountTypes.MANAGER]), controller.getAllManagers])
  .delete([
    validateToken([accountTypes.MANAGER]),
    controller.deleteAllManagers,
  ]);

// router.route('/managers/:id')

router
  .route('/u')
  .get([validateToken([accountTypes.MANAGER]), controller.getManagerFromToken])
  .delete([
    validateToken([accountTypes.MANAGER]),
    controller.deleteManagerFromToken,
  ]);

router.route('/register').post(controller.register);

router.route('/login').post(controller.login);

export default router;
