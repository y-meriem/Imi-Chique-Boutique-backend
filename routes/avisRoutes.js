const express = require('express');
const router = express.Router();
const avisController = require('../controllers/avisController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Middleware optionnel : vérifie le token s'il existe, sinon continue
const optionalProtect = async (req, res, next) => {
  try {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      const token = req.headers.authorization.split(' ')[1];
      const jwt = require('jsonwebtoken');
      const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
      
      const decoded = jwt.verify(token, JWT_SECRET);
      const UserModel = require('../models/userModel');
      const user = await UserModel.findById(decoded.id);
      
      if (user) {
        req.user = user;
      }
    }
  } catch (error) {
  }
  next();
};

// Routes publiques avec authentification optionnelle
router.post('/', optionalProtect, avisController.createAvis);
router.get('/produit/:produit_id', avisController.getAvisByProduct);
router.get('/general', avisController.getGeneralAvis);

// Routes utilisateur protégées
router.get('/my-avis', protect, avisController.getMyAvis);
router.delete('/:id', protect, avisController.deleteMyAvis); // ✅ Route simplifiée

// Routes admin
router.get('/admin', protect, authorize('admin'), avisController.getAllAvis);
router.put('/admin/:id', protect, authorize('admin'), avisController.updateStatutAvis);
router.delete('/admin/:id', protect, authorize('admin'), avisController.deleteAvis);

module.exports = router;