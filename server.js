// server.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const promoRoutes = require('./routes/promoRoutes');
const livraisonsRoutes = require('./routes/livraisonsRoutes');
const userRoutes = require('./routes/userRoutes');
const avisRoutes = require('./routes/avisRoutes');
const favorisRoutes = require('./routes/favorisRoutes');
const stockRoutes = require('./routes/stockRoutes');

const app = express();

// Configuration CORS pour GitHub Pages et Render
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://y-meriem.github.io', // ✅ GitHub Pages
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Permet les requêtes sans origin (Postman, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      console.log('✅ Origin autorisée:', origin);
      callback(null, true);
    } else {
      console.log('❌ Origin bloquée:', origin);
      callback(new Error('Non autorisé par CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Route de santé pour Render
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Serveur en ligne',
    timestamp: new Date().toISOString()
  });
});

// Route de test pour l'API
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    success: true,
    message: 'API fonctionne correctement',
    endpoints: {
      users: '/api/users',
      products: '/api/products',
      orders: '/api/orders'
    }
  });
});

// Routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/promo', promoRoutes);
app.use('/api/livraisons', livraisonsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/avis', avisRoutes);
app.use('/api/favoris', favorisRoutes);
app.use('/api/stock', stockRoutes);

const orderController = require('./controllers/orderController');
app.get('/api/users/:userId/orders', orderController.getOrdersByUserId);

// Gestion des routes non trouvées
app.use((req, res, next) => {
  console.log('❌ Route non trouvée:', req.method, req.path);
  res.status(404).json({ 
    success: false, 
    message: `Route ${req.method} ${req.path} non trouvée` 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Erreur serveur:', err.stack);
  res.status(500).json({ 
    success: false, 
    message: err.message || 'Une erreur est survenue' 
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS activé pour:`, allowedOrigins);
  console.log(`✅ Health check disponible sur: /health et /api/health`);
});

// Gestion des erreurs non capturées
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});
