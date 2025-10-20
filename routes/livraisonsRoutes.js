const express = require('express');
const router = express.Router();
const livraisonController = require('../controllers/livraisonController');
const { protect } = require('../middleware/authMiddleware');

// Routes publiques (GET) - Accessibles à tous
router.get('/', livraisonController.getAllLivraisons);
router.get('/:wilaya', livraisonController.getLivraisonByWilaya);

// Routes admin protégées (POST, PUT, DELETE)
router.post('/', protect, livraisonController.createLivraison);
router.put('/:id', protect, livraisonController.updateLivraison);
router.delete('/:id', protect, livraisonController.deleteLivraison);

module.exports = router;