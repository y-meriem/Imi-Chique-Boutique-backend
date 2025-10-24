// routes/stockRoutes.js
const express = require('express');
const StockController = require('../controllers/stockController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Toutes les routes nécessitent l'authentification admin
router.use(protect);
router.use(authorize('admin'));

// Routes
router.get('/', StockController.getAllStock);
router.get('/stats', StockController.getStockStats);
router.get('/search', StockController.searchStock);
router.get('/product/:id', StockController.getStockByProduct);
router.put('/:id', StockController.updateStock);

module.exports = router;

