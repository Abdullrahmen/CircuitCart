import { Router } from 'express';
import controller from '../controllers/category.controller';
import validateToken from '../middlewares/validateToken';
import accountTypes from '../utils/accountTypes';
const router = Router();

router
  .route('/')
  .get(controller.getAllCategories)
  .post([
    validateToken([accountTypes.SELLER, accountTypes.MANAGER]),
    controller.addCategory,
  ])
  .delete([
    validateToken([accountTypes.SELLER, accountTypes.MANAGER]),
    controller.deleteAllCategories,
  ]);

router
  .route('/:name')
  .get(controller.getCategory)
  .delete([
    validateToken([accountTypes.SELLER, accountTypes.MANAGER]),
    controller.deleteCategory,
  ]);
export default router;
