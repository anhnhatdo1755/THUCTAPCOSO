const express = require('express');
const router = express.Router();
const CartController = require('../controllers/cartController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', CartController.getCart);
router.post('/', CartController.addToCart);
router.put('/:cartProductId', CartController.updateCartItem);
router.delete('/:productId', CartController.removeFromCart);
router.delete('/', CartController.clearCart);

module.exports = router; 