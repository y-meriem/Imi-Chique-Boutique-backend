const express = require('express');
const router = express.Router();
const favorisController = require('../controllers/favorisController');
const { protect } = require('../middleware/authMiddleware');

// Toutes les routes nécessitent l'authentification
router.post('/', protect, favorisController.addFavori);
router.delete('/:produit_id', protect, favorisController.removeFavori);
router.get('/', protect, favorisController.getFavoris);
router.get('/check/:produit_id', protect, favorisController.checkFavori);

module.exports = router;