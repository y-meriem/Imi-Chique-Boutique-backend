// backend/routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const categoryController = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');
const { storage } = require('../config/cloudinary'); // ✨ Import Cloudinary

// Configuration de Multer avec Cloudinary
const upload = multer({
  storage: storage, // ✨ Utiliser le storage Cloudinary
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);
router.post('/', protect, upload.single('image'), categoryController.createCategory);
router.put('/:id', protect, upload.single('image'), categoryController.updateCategory);
router.delete('/:id', protect, categoryController.deleteCategory);

module.exports = router;
