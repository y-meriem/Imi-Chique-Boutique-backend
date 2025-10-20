const express = require('express');
const router = express.Router();
const OrderModel = require('../models/orderModel');
const PromoController = require('../controllers/promoController');
const { protect} = require('../middleware/authMiddleware');


// Vérifier un code promo
router.post('/verify', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ 
        valid: false, 
        message: 'Code promo requis' 
      });
    }

    const result = await OrderModel.verifyPromoCode(code);
    res.json(result);
  } catch (error) {
    console.error('Erreur vérification promo:', error);
    res.status(500).json({ 
      valid: false, 
      message: 'Erreur serveur' 
    });
  }
});


// Routes Admin - CRUD
router.post('/',protect, PromoController.createPromo);
router.get('/',protect, PromoController.getAllPromos);
router.get('/:id',protect, PromoController.getPromoById);
router.put('/:id',protect, PromoController.updatePromo);
router.delete('/:id',protect, PromoController.deletePromo);
router.patch('/:id/toggle',protect, PromoController.toggleStatus);
router.get('/:id/stats',protect, PromoController.getPromoStats);

module.exports = router;



