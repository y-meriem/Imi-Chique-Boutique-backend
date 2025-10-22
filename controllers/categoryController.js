// backend/controllers/categoryController.js
const Category = require('../models/categoryModel');
const cloudinary = require('../config/cloudinary');

// 🔹 Fonction utilitaire pour extraire le public_id d'une URL Cloudinary
const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  
  // Exemple d'URL: https://res.cloudinary.com/demo/image/upload/v1234567890/categories/abc123.jpg
  // On veut: categories/abc123
  
  const parts = url.split('/');
  const uploadIndex = parts.indexOf('upload');
  
  if (uploadIndex === -1) return null;
  
  // Prendre tout après 'upload' et 'v1234567890' (version)
  const pathParts = parts.slice(uploadIndex + 2); // Skip 'upload' et version
  const fileWithExt = pathParts.join('/');
  
  // Enlever l'extension
  return fileWithExt.replace(/\.[^/.]+$/, '');
};

const categoryController = {
  // GET /api/categories
  getAllCategories: async (req, res) => {
    try {
      const categories = await Category.getAll();
      res.status(200).json({ success: true, data: categories });
    } catch (error) {
      console.error('❌ Erreur getAllCategories:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la récupération des catégories'
      });
    }
  },

  // GET /api/categories/:id
  getCategoryById: async (req, res) => {
    try {
      const { id } = req.params;
      const category = await Category.getById(id);

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Catégorie non trouvée'
        });
      }

      res.status(200).json({ success: true, data: category });
    } catch (error) {
      console.error('❌ Erreur getCategoryById:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur'
      });
    }
  },

  // POST /api/categories - Créer une catégorie
  createCategory: async (req, res) => {
    try {
      const { nom } = req.body;
      const image = req.file;

      // Validation
      if (!nom || nom.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Le nom de la catégorie est requis'
        });
      }

      // Vérifier si la catégorie existe déjà
      const exists = await Category.existsByName(nom);
      if (exists) {
        // Si une image a été uploadée, la supprimer de Cloudinary
        if (image && image.public_id) {
          await cloudinary.uploader.destroy(image.public_id);
        }
        return res.status(409).json({
          success: false,
          message: 'Une catégorie avec ce nom existe déjà'
        });
      }

      // L'URL Cloudinary est dans req.file.path
      const image_url = image ? image.path : null;

      console.log('✅ Image uploadée:', {
        url: image_url,
        public_id: image?.public_id
      });

      const newCategory = await Category.create(nom.trim(), image_url);

      res.status(201).json({
        success: true,
        message: 'Catégorie créée avec succès',
        data: newCategory
      });
    } catch (error) {
      console.error('❌ Erreur createCategory:', error);
      
      // Si erreur, supprimer l'image uploadée sur Cloudinary
      if (req.file && req.file.public_id) {
        try {
          await cloudinary.uploader.destroy(req.file.public_id);
          console.log('🗑️ Image Cloudinary supprimée après erreur');
        } catch (cleanupError) {
          console.error('❌ Erreur cleanup Cloudinary:', cleanupError);
        }
      }
      
      res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la création'
      });
    }
  },

  // PUT /api/categories/:id - Mettre à jour une catégorie
  updateCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const { nom } = req.body;
      const image = req.file;

      // Validation
      if (!nom || nom.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Le nom de la catégorie est requis'
        });
      }

      // Récupérer la catégorie existante
      const category = await Category.getById(id);
      if (!category) {
        // Supprimer la nouvelle image si elle a été uploadée
        if (image && image.public_id) {
          await cloudinary.uploader.destroy(image.public_id);
        }
        return res.status(404).json({
          success: false,
          message: 'Catégorie non trouvée'
        });
      }

      // Vérifier le nom unique
      const exists = await Category.existsByName(nom, id);
      if (exists) {
        // Supprimer la nouvelle image si elle a été uploadée
        if (image && image.public_id) {
          await cloudinary.uploader.destroy(image.public_id);
        }
        return res.status(409).json({
          success: false,
          message: 'Une catégorie avec ce nom existe déjà'
        });
      }

      let image_url = category.image_url;

      // Si une nouvelle image est uploadée
      if (image) {
        // Supprimer l'ancienne image de Cloudinary
        if (category.image_url) {
          const oldPublicId = getPublicIdFromUrl(category.image_url);
          if (oldPublicId) {
            try {
              await cloudinary.uploader.destroy(oldPublicId);
              console.log('🗑️ Ancienne image supprimée:', oldPublicId);
            } catch (error) {
              console.error('⚠️ Erreur suppression ancienne image:', error);
            }
          }
        }
        
        // Utiliser la nouvelle URL
        image_url = image.path;
        console.log('✅ Nouvelle image:', image_url);
      }

      const updatedCategory = await Category.update(id, nom.trim(), image_url);

      res.status(200).json({
        success: true,
        message: 'Catégorie mise à jour avec succès',
        data: updatedCategory
      });
    } catch (error) {
      console.error('❌ Erreur updateCategory:', error);
      
      // Cleanup de la nouvelle image en cas d'erreur
      if (req.file && req.file.public_id) {
        try {
          await cloudinary.uploader.destroy(req.file.public_id);
        } catch (cleanupError) {
          console.error('❌ Erreur cleanup:', cleanupError);
        }
      }
      
      res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la mise à jour'
      });
    }
  },

  // DELETE /api/categories/:id
  deleteCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const category = await Category.getById(id);

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Catégorie non trouvée'
        });
      }

      // Supprimer l'image de Cloudinary si elle existe
      if (category.image_url) {
        const publicId = getPublicIdFromUrl(category.image_url);
        if (publicId) {
          try {
            await cloudinary.uploader.destroy(publicId);
            console.log('🗑️ Image supprimée de Cloudinary:', publicId);
          } catch (error) {
            console.error('⚠️ Erreur suppression image Cloudinary:', error);
            // On continue quand même la suppression de la catégorie
          }
        }
      }

      await Category.delete(id);

      res.status(200).json({
        success: true,
        message: 'Catégorie supprimée avec succès'
      });
    } catch (error) {
      console.error('❌ Erreur deleteCategory:', error);
      
      // Erreur de contrainte de clé étrangère
      if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(409).json({
          success: false,
          message: 'Impossible de supprimer cette catégorie car des produits y sont associés'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la suppression'
      });
    }
  }
};

module.exports = categoryController;
