import { Router } from 'express';
import controller from '../controllers/product.controller';
import validateToken from '../middlewares/validateToken';
import accountTypes from '../utils/accountTypes';
const router = Router();

// Manager routes
router
  .route('/manager/collection')
  .delete([
    validateToken([accountTypes.MANAGER]),
    controller.deleteAllProducts,
  ]);
// Search in all products including pending and hidden
router
  .route('/manager/search')
  .get(
    validateToken([accountTypes.MANAGER]),
    controller.getSelectedProducts(true, true)
  )
  .delete(
    validateToken([accountTypes.MANAGER]),
    controller.deleteSelectedProducts(true, true)
  );

// Seller and Guest routes
// Search in all products excluding pending and hidden
router
  .route('/search')
  .get(controller.getSelectedProducts())
  .delete(
    validateToken([accountTypes.MANAGER]),
    controller.deleteSelectedProducts()
  );
router
  .route('/product/:productId')
  .get(controller.getProduct([accountTypes.SELLER, accountTypes.MANAGER]))
  .delete(
    validateToken([accountTypes.SELLER, accountTypes.MANAGER]),
    controller.deleteProduct
  );
router
  .route('/')
  .post(validateToken([accountTypes.SELLER]), controller.addProducts);

export default router;
