import { Router } from 'express';
import controller from '../controllers/category.controller';
import validateToken from '../middlewares/validateToken';
import account from '../utils/accountTypes';
const router = Router();

router
  .route('/')
  .get(controller.getAllCategories)
  .post([
    validateToken([account.SELLER, account.MANAGER]),
    controller.addCategory,
  ])
  .delete([
    validateToken([account.SELLER, account.MANAGER]),
    controller.deleteAllCategories,
  ]);

router
  .route('/:name')
  .get(controller.getCategory)
  .delete([
    validateToken([account.SELLER, account.MANAGER]),
    controller.deleteCategory,
  ]);
export default router;
