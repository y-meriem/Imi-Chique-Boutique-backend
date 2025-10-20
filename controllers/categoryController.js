// backend/controllers/categoryController.js
const Category = require('../models/categoryModel');
const fs = require('fs');
const path = require('path');

const categoryController = {
  // GET /api/categories - Récupérer toutes les catégories
  getAllCategories: async (req, res) => {
    try {
      const categories = await Category.getAll();
      res.status(200).json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la récupération des catégories'
      });
    }
  },

  // GET /api/categories/:id - Récupérer une catégorie
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
      
      // Validation
      if (!nom || nom.trim() === '') {
        // Supprimer l'image uploadée si la validation échoue
        if (image) {
          fs.unlinkSync(image.path);
        }
        return res.status(400).json({
          success: false,
          message: 'Le nom de la catégorie est requis'
        });
      }
      
      // Vérifier si la catégorie existe déjà
      const exists = await Category.existsByName(nom);
      if (exists) {
        if (image) {
          fs.unlinkSync(image.path);
        }
        return res.status(409).json({
          success: false,
          message: 'Une catégorie avec ce nom existe déjà'
        });
      }
      
      // Construire l'URL de l'image
      const image_url = image ? `/uploads/categories/${image.filename}` : null;
      
      const newCategory = await Category.create(nom.trim(), image_url);
      
      res.status(201).json({
        success: true,
        message: 'Catégorie créée avec succès',
        data: newCategory
      });
    } catch (error) {
      console.error('Erreur lors de la création de la catégorie:', error);
      
      // Supprimer l'image en cas d'erreur
      if (req.file) {
        fs.unlinkSync(req.file.path);
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
        if (image) {
          fs.unlinkSync(image.path);
        }
        return res.status(400).json({
          success: false,
          message: 'Le nom de la catégorie est requis'
        });
      }
      
      // Vérifier si la catégorie existe
      const category = await Category.getById(id);
      if (!category) {
        if (image) {
          fs.unlinkSync(image.path);
        }
        return res.status(404).json({
          success: false,
          message: 'Catégorie non trouvée'
        });
      }
      
      // Vérifier si le nouveau nom existe déjà (sauf pour la catégorie actuelle)
      const exists = await Category.existsByName(nom, id);
      if (exists) {
        if (image) {
          fs.unlinkSync(image.path);
        }
        return res.status(409).json({
          success: false,
          message: 'Une catégorie avec ce nom existe déjà'
        });
      }
      
      // Si une nouvelle image est uploadée
      let image_url = category.image_url;
      if (image) {
        // Supprimer l'ancienne image
        if (category.image_url) {
          const oldImagePath = path.join(__dirname, '..', category.image_url);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        image_url = `/uploads/categories/${image.filename}`;
      }
      
      const updatedCategory = await Category.update(id, nom.trim(), image_url);
      
      res.status(200).json({
        success: true,
        message: 'Catégorie mise à jour avec succès',
        data: updatedCategory
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la catégorie:', error);
      
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      
      res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la mise à jour'
      });
    }
  },

  // DELETE /api/categories/:id - Supprimer une catégorie
  deleteCategory: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Vérifier si la catégorie existe
      const category = await Category.getById(id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Catégorie non trouvée'
        });
      }
      
      await Category.delete(id);
      
      // Supprimer l'image associée
      if (category.image_url) {
        const imagePath = path.join(__dirname, '..', category.image_url);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
      
      res.status(200).json({
        success: true,
        message: 'Catégorie supprimée avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de la catégorie:', error);
      
      // Gestion erreur de clé étrangère (produits associés)
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