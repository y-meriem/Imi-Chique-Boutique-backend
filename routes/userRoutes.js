const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize, isOwnerOrAdmin } = require('../middleware/authMiddleware');

// ==========================================
// 🔓 Routes publiques (pas d'authentification)
// ==========================================
router.post('/register', userController.register);
router.post('/login', userController.login);

// 🔐 Réinitialisation mot de passe (3 étapes)
router.post('/forgot-password', userController.forgotPassword);      // Étape 1: Envoyer code
router.post('/verify-code', userController.verifyResetCode);         // ✅ NOUVEAU - Étape 2: Vérifier code
router.post('/reset-password', userController.resetPassword);        // Étape 3: Changer mot de passe

// ==========================================
// 🔒 Routes protégées (utilisateur connecté)
// ==========================================
router.post('/logout', protect, userController.logout);
router.get('/profile', protect, userController.getProfile);
router.put('/profile', protect, userController.updateProfile);

// Routes : l'utilisateur peut modifier son profil OU admin peut modifier n'importe quel profil
router.put('/:id', protect, isOwnerOrAdmin, userController.updateUser);

// ==========================================
// 👑 Routes admin uniquement
// ==========================================
router.get('/', protect, authorize('admin'), userController.getAllUsers);
router.get('/:id', protect, authorize('admin'), userController.getUserById);
router.delete('/:id', protect, authorize('admin'), userController.deleteUser);

// ==========================================
// 📦 Routes des commandes
// ==========================================
router.get('/:id/orders', protect, isOwnerOrAdmin, userController.getUserOrders);
router.get('/:userId/orders/:orderId', protect, isOwnerOrAdmin, userController.getUserOrderById);

module.exports = router;
