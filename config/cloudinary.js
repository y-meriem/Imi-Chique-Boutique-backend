// backend/config/cloudinary.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configuration du storage pour Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'categories', // Dossier dans Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 800, height: 800, crop: 'limit' }, // Redimensionner
      { quality: 'auto' } // Optimisation automatique
    ]
  }
});

module.exports = { cloudinary, storage };