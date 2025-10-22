// backend/controllers/categoryController.js
const Category = require('../models/categoryModel');
const { cloudinary } = require('../config/cloudinary');

const categoryController = {
  // GET /api/categories
  getAllCategories: async (req, res) => {
    try {
      const categories = await Category.getAll();
      res.status(200).json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Erreur getAllCategories:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur'
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
      
      res.status(200).json({
        success: true,
        data: category
      });
    } catch (error) {
      console.error('Erreur getCategoryById:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur'
      });
    }
  },

  // POST /api/categories
  createCategory: async (req, res) => {
    try {
      const { nom } = req.body;
      const image = req.file;
      
      // Validation
      if (!nom || nom.trim() === '') {
        // Supprimer l'image de Cloudinary si validation échoue
        if (image && image.filename) {
          await cloudinary.uploader.destroy(image.filename);
        }
        return res.status(400).json({
          success: false,
          message: 'Le nom de la catégorie est requis'
        });
      }
      
      // Vérifier si la catégorie existe déjà
      const exists = await Category.existsByName(nom);
      if (exists) {
        if (image && image.filename) {
          await cloudinary.uploader.destroy(image.filename);
        }
        return res.status(409).json({
          success: false,
          message: 'Une catégorie avec ce nom existe déjà'
        });
      }
      
      // URL de l'image Cloudinary (ou null)
      const image_url = image ? image.path : null;
      const cloudinary_id = image ? image.filename : null;
      
      const newCategory = await Category.create(nom.trim(), image_url, cloudinary_id);
      
      res.status(201).json({
        success: true,
        message: 'Catégorie créée avec succès',
        data: newCategory
      });
    } catch (error) {
      console.error('Erreur createCategory:', error);
      
      // Supprimer l'image en cas d'erreur
      if (req.file && req.file.filename) {
        await cloudinary.uploader.destroy(req.file.filename);
      }
      
      res.status(500).json({
        success: false,
        message: 'Erreur serveur'
      });
    }
  },

  // PUT /api/categories/:id
  updateCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const { nom } = req.body;
      const image = req.file;
      
      // Validation
      if (!nom || nom.trim() === '') {
        if (image && image.filename) {
          await cloudinary.uploader.destroy(image.filename);
        }
        return res.status(400).json({
          success: false,
          message: 'Le nom de la catégorie est requis'
        });
      }
      
      // Vérifier si la catégorie existe
      const category = await Category.getById(id);
      if (!category) {
        if (image && image.filename) {
          await cloudinary.uploader.destroy(image.filename);
        }
        return res.status(404).json({
          success: false,
          message: 'Catégorie non trouvée'
        });
      }
      
      // Vérifier si le nouveau nom existe déjà
      const exists = await Category.existsByName(nom, id);
      if (exists) {
        if (image && image.filename) {
          await cloudinary.uploader.destroy(image.filename);
        }
        return res.status(409).json({
          success: false,
          message: 'Une catégorie avec ce nom existe déjà'
        });
      }
      
      // Gestion de l'image
      let image_url = category.image_url;
      let cloudinary_id = category.cloudinary_id;
      
      if (image) {
        // Supprimer l'ancienne image de Cloudinary
        if (category.cloudinary_id) {
          await cloudinary.uploader.destroy(category.cloudinary_id);
        }
        image_url = image.path;
        cloudinary_id = image.filename;
      }
      
      const updatedCategory = await Category.update(id, nom.trim(), image_url, cloudinary_id);
      
      res.status(200).json({
        success: true,
        message: 'Catégorie mise à jour avec succès',
        data: updatedCategory
      });
    } catch (error) {
      console.error('Erreur updateCategory:', error);
      
      if (req.file && req.file.filename) {
        await cloudinary.uploader.destroy(req.file.filename);
      }
      
      res.status(500).json({
        success: false,
        message: 'Erreur serveur'
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
      
      await Category.delete(id);
      
      // Supprimer l'image de Cloudinary
      if (category.cloudinary_id) {
        await cloudinary.uploader.destroy(category.cloudinary_id);
      }
      
      res.status(200).json({
        success: true,
        message: 'Catégorie supprimée avec succès'
      });
    } catch (error) {
      console.error('Erreur deleteCategory:', error);
      
      if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(409).json({
          success: false,
          message: 'Impossible de supprimer - produits associés'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Erreur serveur'
      });
    }
  }
};

module.exports = categoryController;
