// backend/routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const categoryController = require('../controllers/categoryController');
const { protect} = require('../middleware/authMiddleware');

// Configuration de Multer pour l'upload d'images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/categories/'); // Dossier de destination
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'category-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtrer les types de fichiers acceptés
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Seules les images (jpeg, jpg, png, gif, webp) sont autorisées'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Limite à 5MB
});

router.get('/', categoryController.getAllCategories); 

router.get('/:id', categoryController.getCategoryById);

// POST /api/categories - Créer une nouvelle catégorie (avec image)
router.post('/', protect, upload.single('image'), categoryController.createCategory);

// PUT /api/categories/:id - Mettre à jour une catégorie (avec image)
router.put('/:id',protect, upload.single('image'), categoryController.updateCategory);

// DELETE /api/categories/:id - Supprimer une catégorie
router.delete('/:id', protect, categoryController.deleteCategory);

module.exports = router;