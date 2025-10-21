// backend/controllers/categoryController.js
const Category = require('../models/categoryModel');
const cloudinary = require('../config/cloudinary');

const categoryController = {
  // GET /api/categories
  getAllCategories: async (req, res) => {
    try {
      const categories = await Category.getAll();
      res.status(200).json({ success: true, data: categories });
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories:', error);
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
      console.error('Erreur lors de la récupération de la catégorie:', error);
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

      if (!nom || nom.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Le nom de la catégorie est requis'
        });
      }

      const exists = await Category.existsByName(nom);
      if (exists) {
        return res.status(409).json({
          success: false,
          message: 'Une catégorie avec ce nom existe déjà'
        });
      }

      // 🔹 Cloudinary gère déjà l’upload — l’URL est dans req.file.path
      const image_url = image ? req.file.path : null;

      const newCategory = await Category.create(nom.trim(), image_url);

      res.status(201).json({
        success: true,
        message: 'Catégorie créée avec succès',
        data: newCategory
      });
    } catch (error) {
      console.error('Erreur lors de la création de la catégorie:', error);
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

      if (!nom || nom.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Le nom de la catégorie est requis'
        });
      }

      const category = await Category.getById(id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Catégorie non trouvée'
        });
      }

      const exists = await Category.existsByName(nom, id);
      if (exists) {
        return res.status(409).json({
          success: false,
          message: 'Une catégorie avec ce nom existe déjà'
        });
      }

      // 🔹 Si nouvelle image → supprimer l’ancienne sur Cloudinary
      let image_url = category.image_url;
      if (image) {
        if (category.image_url) {
          // Récupère le public_id pour supprimer l’ancienne
          const publicId = category.image_url.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`categories/${publicId}`);
        }
        image_url = req.file.path; // nouvelle URL Cloudinary
      }

      const updatedCategory = await Category.update(id, nom.trim(), image_url);

      res.status(200).json({
        success: true,
        message: 'Catégorie mise à jour avec succès',
        data: updatedCategory
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la catégorie:', error);
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

      // 🔹 Supprimer l’image de Cloudinary si elle existe
      if (category.image_url) {
        const publicId = category.image_url.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`categories/${publicId}`);
      }

      await Category.delete(id);

      res.status(200).json({
        success: true,
        message: 'Catégorie supprimée avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de la catégorie:', error);
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
