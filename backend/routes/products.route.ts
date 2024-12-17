import { Router } from 'express';
import controller from '../controllers/product.controller';
import validateToken from '../middlewares/validateToken';
import account from '../utils/accountTypes';
const router = Router();

// Manager routes
router
  .route('/manager/collection')
  .delete([validateToken([account.MANAGER]), controller.deleteAllProducts]);
// Search in all products including pending and hidden
router
  .route('/manager/search')
  .get(
    validateToken([account.MANAGER]),
    controller.getSelectedProducts(true, true)
  )
  .delete(
    validateToken([account.MANAGER]),
    controller.deleteSelectedProducts(true, true)
  );

// Seller and Guest routes
// Search in all products excluding pending and hidden
router
  .route('/search')
  .get(controller.getSelectedProducts())
  .delete(
    validateToken([account.MANAGER]),
    controller.deleteSelectedProducts()
  );

router.route('/ids').get(controller.getProductsByIds);

router
  .route('/product/:productId')
  .get(controller.getProduct([account.SELLER, account.MANAGER]))
  .delete(
    validateToken([account.SELLER, account.MANAGER]),
    controller.deleteProduct
  );

router.route('/').post(validateToken([account.SELLER]), controller.addProducts);

export default router;
