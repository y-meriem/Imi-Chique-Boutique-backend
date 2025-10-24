// controllers/stockController.js
const db = require('../config/database');

class StockController {
  // Récupérer tout le stock avec détails produit/couleur
  static async getAllStock(req, res) {
    try {
      const [stock] = await db.query(`
        SELECT 
          s.id,
          s.id_produit,
          s.id_couleur,
          s.taille,
          s.quantite,
          p.titre as produit_titre,
          p.prix as produit_prix,
          c.couleur as couleur_nom,
          c.code_couleur
        FROM stock_produits s
        INNER JOIN produits p ON s.id_produit = p.id
        INNER JOIN couleurs_produit c ON s.id_couleur = c.id
        ORDER BY p.titre, c.couleur, s.taille
      `);

      // Récupérer l'image principale pour chaque produit
      for (let item of stock) {
        const [images] = await db.query(
          `SELECT url_image FROM images_produit 
           WHERE id_produit = ? AND est_principale = 1 
           LIMIT 1`,
          [item.id_produit]
        );
        item.produit_image = images.length > 0 ? images[0].url_image : null;
      }

      res.status(200).json({
        success: true,
        count: stock.length,
        data: stock
      });
    } catch (error) {
      console.error('Erreur récupération stock:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du stock',
        error: error.message
      });
    }
  }

  // Récupérer le stock d'un produit spécifique
  static async getStockByProduct(req, res) {
    try {
      const { id } = req.params;

      const [stock] = await db.query(`
        SELECT 
          s.id,
          s.id_couleur,
          s.taille,
          s.quantite,
          c.couleur as couleur_nom,
          c.code_couleur
        FROM stock_produits s
        INNER JOIN couleurs_produit c ON s.id_couleur = c.id
        WHERE s.id_produit = ?
        ORDER BY c.couleur, s.taille
      `, [id]);

      res.status(200).json({
        success: true,
        data: stock
      });
    } catch (error) {
      console.error('Erreur récupération stock produit:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du stock',
        error: error.message
      });
    }
  }

  // Mettre à jour la quantité en stock
  static async updateStock(req, res) {
    try {
      const { id } = req.params;
      const { quantite, operation } = req.body;

      let query;
      let params;

      if (operation === 'set') {
        // Définir une quantité exacte
        query = `UPDATE stock_produits SET quantite = ? WHERE id = ?`;
        params = [quantite, id];
      } else if (operation === 'add') {
        // Ajouter à la quantité existante
        query = `UPDATE stock_produits SET quantite = quantite + ? WHERE id = ?`;
        params = [quantite, id];
      } else if (operation === 'subtract') {
        // Soustraire de la quantité existante
        query = `UPDATE stock_produits SET quantite = GREATEST(0, quantite - ?) WHERE id = ?`;
        params = [quantite, id];
      } else {
        return res.status(400).json({
          success: false,
          message: 'Opération invalide. Utilisez: set, add ou subtract'
        });
      }

      await db.query(query, params);

      // Récupérer le stock mis à jour
      const [updatedStock] = await db.query(
        `SELECT * FROM stock_produits WHERE id = ?`,
        [id]
      );

      res.status(200).json({
        success: true,
        message: 'Stock mis à jour avec succès',
        data: updatedStock[0]
      });
    } catch (error) {
      console.error('Erreur mise à jour stock:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour du stock',
        error: error.message
      });
    }
  }

  // Récupérer les statistiques de stock
  static async getStockStats(req, res) {
    try {
      const [stats] = await db.query(`
        SELECT 
          COUNT(*) as total_variants,
          SUM(quantite) as total_items,
          COUNT(CASE WHEN quantite = 0 THEN 1 END) as rupture_stock,
          COUNT(CASE WHEN quantite > 0 AND quantite <= 10 THEN 1 END) as stock_faible,
          COUNT(CASE WHEN quantite > 10 THEN 1 END) as stock_ok
        FROM stock_produits
      `);

      res.status(200).json({
        success: true,
        data: stats[0]
      });
    } catch (error) {
      console.error('Erreur stats stock:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des statistiques',
        error: error.message
      });
    }
  }

  // Rechercher dans le stock
  static async searchStock(req, res) {
    try {
      const { search } = req.query;

      const [stock] = await db.query(`
        SELECT 
          s.id,
          s.id_produit,
          s.id_couleur,
          s.taille,
          s.quantite,
          p.titre as produit_titre,
          p.prix as produit_prix,
          c.couleur as couleur_nom,
          c.code_couleur
        FROM stock_produits s
        INNER JOIN produits p ON s.id_produit = p.id
        INNER JOIN couleurs_produit c ON s.id_couleur = c.id
        WHERE p.titre LIKE ? OR c.couleur LIKE ?
        ORDER BY p.titre, c.couleur, s.taille
      `, [`%${search}%`, `%${search}%`]);

      // Récupérer les images
      for (let item of stock) {
        const [images] = await db.query(
          `SELECT url_image FROM images_produit 
           WHERE id_produit = ? AND est_principale = 1 
           LIMIT 1`,
          [item.id_produit]
        );
        item.produit_image = images.length > 0 ? images[0].url_image : null;
      }

      res.status(200).json({
        success: true,
        count: stock.length,
        data: stock
      });
    } catch (error) {
      console.error('Erreur recherche stock:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la recherche',
        error: error.message
      });
    }
  }
}

module.exports = StockController;
