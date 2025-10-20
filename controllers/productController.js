// controllers/productController.js
const ProductModel = require('../models/productModel');
const path = require('path');

class ProductController {
  // Créer un nouveau produit
    static async createProduct(req, res) {
  try {
    const productData = req.body;

    // Parser les données JSON si elles sont en string
    if (typeof productData.couleurs === 'string') {
      productData.couleurs = JSON.parse(productData.couleurs);
    }
    if (typeof productData.tailles === 'string') {
      productData.tailles = JSON.parse(productData.tailles);
    }
    if (typeof productData.imageColors === 'string') {
      productData.imageColors = JSON.parse(productData.imageColors);
    }
    if (typeof productData.stock === 'string') {
  productData.stock = JSON.parse(productData.stock);
}

    // Gérer les images uploadées
    if (req.files && req.files.length > 0) {
      productData.images = req.files.map((file, index) => ({
        url_image: `/uploads/${file.filename}`,
        couleur: productData.imageColors && productData.imageColors[index] ? productData.imageColors[index] : null,
        ordre: index + 1,
        est_principale: index === 0
      }));
    }

    const result = await ProductModel.createProduct(productData);

    res.status(201).json({
      success: true,
      message: 'Produit créé avec succès',
      productId: result.productId
    });
  } catch (error) {
    console.error('Erreur création produit:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du produit',
      error: error.message
    });
  }  
}

  // Récupérer tous les produits
  static async getAllProducts(req, res) {
    try {
      const products = await ProductModel.getAllProducts();

      res.status(200).json({
        success: true,
        count: products.length,
        data: products
      });
    } catch (error) {
      console.error('Erreur récupération produits:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des produits',
        error: error.message
      });
    }
  }

  // Récupérer un produit par ID
  static async getProductById(req, res) {
    try {
      const { id } = req.params;
      const product = await ProductModel.getProductById(id);

      res.status(200).json({
        success: true,
        data: product  //
      });
    } catch (error) {
      console.error('Erreur récupération produit:', error);
      
      if (error.message === 'Produit non trouvé') {
        res.status(404).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Erreur lors de la récupération du produit',
          error: error.message
        });
      }
    }
  }

  // Mettre à jour un produit
 static async updateProduct(req, res) {
  try {
    const { id } = req.params;
    const productData = req.body;

    // Parser les données JSON
    if (typeof productData.couleurs === 'string') {
      productData.couleurs = JSON.parse(productData.couleurs);
    }
    if (typeof productData.couleursToDelete === 'string') {
      productData.couleursToDelete = JSON.parse(productData.couleursToDelete);
    }
    if (typeof productData.tailles === 'string') {
      productData.tailles = JSON.parse(productData.tailles);
    }
    if (typeof productData.imageColors === 'string') {
      productData.imageColors = JSON.parse(productData.imageColors);
    }
    if (typeof productData.existingImages === 'string') {
      productData.existingImages = JSON.parse(productData.existingImages);
    }
    if (typeof productData.imagesToDelete === 'string') {
      productData.imagesToDelete = JSON.parse(productData.imagesToDelete);
    }
    if (typeof productData.stock === 'string') {
     productData.stock = JSON.parse(productData.stock);
    }
    
    // Gérer les nouvelles images uploadées
    if (req.files && req.files.length > 0) {
      productData.images = req.files.map((file, index) => ({
        url_image: `/uploads/${file.filename}`,
        couleur: productData.imageColors && productData.imageColors[index] ? productData.imageColors[index] : null
      }));
    }

    const result = await ProductModel.updateProduct(id, productData);

    res.status(200).json({
      success: true,
      message: 'Produit mis à jour avec succès',
      productId: result.productId
    });
  } catch (error) {
    console.error('Erreur mise à jour produit:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du produit',
      error: error.message
    });
  }
}

  // Supprimer un produit
  static async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      await ProductModel.deleteProduct(id);

      res.status(200).json({
        success: true,
        message: 'Produit supprimé avec succès'
      });
    } catch (error) {
      console.error('Erreur suppression produit:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression du produit',
        error: error.message
      });
    }
  }
}

module.exports = ProductController;