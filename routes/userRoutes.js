const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize, isOwnerOrAdmin } = require('../middleware/authMiddleware');

// Routes publiques
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);

router.post('/logout', protect, userController.logout);

// Routes protégées (accessible par tout utilisateur connecté)
router.get('/profile', protect, userController.getProfile);

// Routes : l'utilisateur peut modifier son profil OU admin peut modifier n'importe quel profil
router.put('/:id', protect, isOwnerOrAdmin, userController.updateUser);

// Routes admin uniquement
router.get('/', protect, authorize('admin'), userController.getAllUsers);
router.get('/:id', protect, authorize('admin'), userController.getUserById);
router.delete('/:id', protect, authorize('admin'), userController.deleteUser);

// Routes des commandes
router.get('/:id/orders', protect, isOwnerOrAdmin, userController.getUserOrders);
router.get('/:userId/orders/:orderId', protect, isOwnerOrAdmin, userController.getUserOrderById);

module.exports = router;