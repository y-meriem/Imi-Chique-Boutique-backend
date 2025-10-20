// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', orderController.createOrder);
router.get('/', protect,authorize('admin'),orderController.getAllOrders);
router.get('/user/:userId', protect, orderController.getOrdersByUserId);
router.get('/:id', protect,orderController.getOrderById);
router.put('/:id/status', protect, authorize('admin') ,orderController.updateOrderStatus);


module.exports = router;