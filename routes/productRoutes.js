const express = require('express');
const multer = require('multer');
const ProductController = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { storage } = require('../config/cloudinary'); // ✨ Import Cloudinary

const router = express.Router();

// Configuration de Multer avec Cloudinary
const upload = multer({
  storage: storage, // ✨ Utiliser le storage Cloudinary
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

// Routes
router.post('/', protect, upload.array('images', 10), ProductController.createProduct);
router.get('/:id', ProductController.getProductById);
router.get('/', ProductController.getAllProducts);
router.put('/:id', protect, upload.array('images', 10), ProductController.updateProduct);
router.delete('/:id', protect, ProductController.deleteProduct);

module.exports = router;
