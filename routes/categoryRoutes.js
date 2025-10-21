// backend/routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const categoryController = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');

// Configuration du stockage Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'categories', // Dossier dans ton Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }], // optionnel
  },
});

const upload = multer({ storage });

// Routes
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);

// POST /api/categories - Créer une nouvelle catégorie (avec image)
router.post('/', protect, upload.single('image'), categoryController.createCategory);

// PUT /api/categories/:id - Mettre à jour une catégorie (avec image)
router.put('/:id', protect, upload.single('image'), categoryController.updateCategory);

// DELETE /api/categories/:id - Supprimer une catégorie
router.delete('/:id', protect, categoryController.deleteCategory);

module.exports = router;
