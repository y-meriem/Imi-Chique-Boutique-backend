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

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: err.message || 'Une erreur est survenue' 
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
