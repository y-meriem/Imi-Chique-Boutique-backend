// controllers/productController.js
const ProductModel = require('../models/productModel');

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

      // Validation des données requises
      if (!productData.titre || !productData.prix) {
        return res.status(400).json({
          success: false,
          message: 'Titre et prix sont requis'
        });
      }

      // Gérer les images uploadées
      if (req.files && req.files.length > 0) {
        productData.images = req.files.map((file, index) => ({
          url_image: file.path,
          cloudinary_id: file.filename,
          couleur: productData.imageColors && productData.imageColors[index] 
            ? productData.imageColors[index] 
            : null,
          ordre: index + 1,
          est_principale: index === 0
        }));
      } else {
        productData.images = [];
      }

      const result = await ProductModel.createProduct(productData);

      res.status(201).json({
        success: true,
        message: 'Produit créé avec succès',
        productId: result.productId
      });
    } catch (error) {
      console.error('❌ Erreur création produit:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la création du produit',
        error: error.message,
        details: error.stack // Pour debug
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
      console.error('❌ Erreur récupération produits:', error);
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
        data: product
      });
    } catch (error) {
      console.error('❌ Erreur récupération produit:', error);
      
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

      console.log('📝 Données reçues pour update:', {
        id,
        body: productData,
        files: req.files?.length || 0
      });

      // Parser les données JSON
      const jsonFields = [
        'couleurs',
        'couleursToDelete',
        'tailles',
        'imageColors',
        'existingImages',
        'imagesToDelete',
        'stock'
      ];

      jsonFields.forEach(field => {
        if (productData[field] && typeof productData[field] === 'string') {
          try {
            productData[field] = JSON.parse(productData[field]);
          } catch (e) {
            console.error(`❌ Erreur parsing ${field}:`, e);
            productData[field] = field === 'stock' ? [] : 
                                 field.includes('Delete') ? [] : 
                                 field.endsWith('s') ? [] : null;
          }
        }
      });

      // Gérer les nouvelles images uploadées
      if (req.files && req.files.length > 0) {
        productData.newImages = req.files.map((file, index) => ({
          url_image: file.path,
          cloudinary_id: file.filename,
          couleur: productData.imageColors && productData.imageColors[index] 
            ? productData.imageColors[index] 
            : null,
          ordre: (productData.existingImages?.length || 0) + index + 1
        }));
      } else {
        productData.newImages = [];
      }

      // Validation basique
      if (!productData.titre || !productData.prix) {
        return res.status(400).json({
          success: false,
          message: 'Titre et prix sont requis'
        });
      }

      console.log('✅ Données parsées:', {
        couleurs: productData.couleurs?.length || 0,
        tailles: productData.tailles?.length || 0,
        stock: productData.stock?.length || 0,
        newImages: productData.newImages?.length || 0,
        existingImages: productData.existingImages?.length || 0
      });

      const result = await ProductModel.updateProduct(id, productData);

      res.status(200).json({
        success: true,
        message: 'Produit mis à jour avec succès',
        productId: result.productId
      });
    } catch (error) {
      console.error('❌ Erreur mise à jour produit:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour du produit',
        error: error.message,
        details: error.stack // Pour debug
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
      console.error('❌ Erreur suppression produit:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression du produit',
        error: error.message
      });
    }
  }
}

module.exports = ProductController;
