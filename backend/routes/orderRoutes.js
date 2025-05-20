const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// User routes
router.use(authMiddleware);
router.post('/', OrderController.createOrder);
router.get('/user', OrderController.getUserOrders);
router.get('/:id', OrderController.getOrderById);

// Admin routes
router.get('/', adminMiddleware, OrderController.getAllOrders);
router.put('/:id/status', adminMiddleware, OrderController.updateOrderStatus);

module.exports = router; 